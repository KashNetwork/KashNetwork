import type { PaymentEvent } from '@/shared';
import { config } from '@/server/config';
import { getDb } from '@/server/db';
import { ok, route, unauthorized } from '@/server/http';
import { processPaymentEvent } from '@/server/services/payments';
import { runNurtureSequenceTick } from '@/server/services/email-sequence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Scheduled maintenance (Vercel Cron, e.g. every 15 min):
 *  - promote commissions past their 30-day hold: pending -> available
 *  - downgrade subscriptions whose cancel-at-period-end date has passed
 *    (belt-and-braces in case the Explodely IPN is late or missing)
 *  - retry any payment events that failed to process
 *  - send the next due step of the free-lead nurture sequence to anyone
 *    who's due (stops automatically once they convert — see payments.ts)
 */
async function tick() {
  const db = await getDb();
  const nowIso = new Date().toISOString();

  const promoted = await db.promoteEligibleCommissions(nowIso);

  const dueSubs = await db.listSubscriptionsDueToExpire(nowIso);
  let expired = 0;
  for (const sub of dueSubs) {
    const profile = await db.getProfileById(sub.profile_id);
    if (!profile) continue;
    const event: PaymentEvent = {
      type: 'subscription_cancelled',
      externalTxnId: `cron_expire_${sub.id}`,
      externalSubId: sub.external_sub_id,
      customerEmail: profile.email,
      amountCents: 0,
      currency: 'USD',
      affiliateRef: null,
      occurredAt: nowIso,
      raw: { source: 'cron' },
      dedupeKey: `cron_expire_${sub.id}:subscription_cancelled`,
    };
    const pe = await db.recordPaymentEvent({
      provider: 'cron',
      eventType: event.type,
      externalTxnId: event.externalTxnId,
      externalSubId: event.externalSubId,
      customerEmail: event.customerEmail,
      amountCents: 0,
      currency: 'USD',
      affiliateRef: null,
      occurredAt: nowIso,
      raw: event.raw,
      signatureValid: true,
      dedupeKey: event.dedupeKey,
    });
    try {
      await processPaymentEvent(db, event, pe.id);
      await db.markPaymentEventProcessed(pe.id, null);
      expired++;
    } catch (e) {
      await db.markPaymentEventProcessed(pe.id, (e as Error).message);
    }
  }

  const stuck = await db.listUnprocessedPaymentEvents(50);
  let retried = 0;
  for (const pe of stuck) {
    try {
      await processPaymentEvent(
        db,
        {
          type: pe.event_type,
          externalTxnId: pe.external_txn_id ?? '',
          externalSubId: pe.external_sub_id,
          customerEmail: pe.customer_email ?? '',
          amountCents: pe.amount_cents,
          currency: pe.currency,
          affiliateRef: pe.affiliate_ref,
          occurredAt: pe.occurred_at,
          raw: pe.raw,
          dedupeKey: pe.dedupe_key,
        },
        pe.id,
      );
      await db.markPaymentEventProcessed(pe.id, null);
      retried++;
    } catch {
      /* leave it for the next tick */
    }
  }

  const nurture = await runNurtureSequenceTick(db);

  return { promoted, expired, retried, nurture };
}

function authed(req: Request): boolean {
  if (!config.secrets.cron) return process.env.NODE_ENV !== 'production';
  const header = req.headers.get('authorization') ?? '';
  const url = new URL(req.url);
  return (
    header === `Bearer ${config.secrets.cron}` || url.searchParams.get('key') === config.secrets.cron
  );
}

export const GET = route(async (req) => {
  if (!authed(req)) throw unauthorized();
  const result = await tick();
  // recorded so /api/health?strict=1 can tell a monitor when the job has stopped
  await (await getDb()).setSetting('cron_last_run', { at: new Date().toISOString() });
  return ok(result);
});
export const POST = GET;
