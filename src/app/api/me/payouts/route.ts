import { z } from 'zod';
import { PAYOUT_METHOD, DEFAULTS } from '@/shared';
import { requirePaid } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { badRequest, forbidden, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  method: z.enum(PAYOUT_METHOD),
  methodDetails: z.string().trim().min(1).max(200),
});

/** GET /api/me/payouts — the affiliate's own cashout history. */
export const GET = route(async () => {
  const { profile } = await requirePaid();
  if (!profile.is_affiliate) throw forbidden('not_an_affiliate');
  const rows = await (await getDb()).listPayoutsByAffiliate(profile.id);
  return ok({
    payouts: rows.map((p) => ({
      id: p.id,
      amountCents: p.amount_cents,
      status: p.status,
      method: p.method,
      requestedAt: p.requested_at,
      paidAt: p.paid_at,
      rejectedReason: p.rejected_reason,
    })),
  });
});

/**
 * POST /api/me/payouts { method, methodDetails } — cash out the whole
 * available balance in one request (not itemized). Requires
 * DEFAULTS.payoutMinCents available; the actual claim is atomic in the repo
 * layer, this route just does the up-front minimum check + friendly errors.
 */
export const POST = route(async (req) => {
  const { profile } = await requirePaid();
  if (!profile.is_affiliate) throw forbidden('not_an_affiliate');

  const parsed = requestSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body', 'Pick a payout method and enter where to send it.');

  const db = await getDb();

  // If the affiliate's own membership is past due, freeze cashouts until
  // they're current again — commissions keep accruing normally underneath
  // (nothing is forfeited yet, that only happens on actual cancellation),
  // they just can't be paid out while the account is delinquent.
  const ownSub = await db.getSubscriptionByProfile(profile.id);
  if (ownSub?.state === 'past_due') {
    throw badRequest(
      'membership_past_due',
      'Your membership payment is past due — cashouts are on hold until your billing is current. Your commissions are safe and still accruing.',
    );
  }

  const stats = await db.affiliateStats(profile.id);
  if (stats.availableCents < DEFAULTS.payoutMinCents) {
    throw badRequest(
      'below_minimum',
      `You need at least ${(DEFAULTS.payoutMinCents / 100).toFixed(0)} available to cash out — you have ${(stats.availableCents / 100).toFixed(2)}.`,
    );
  }

  // also persist the chosen method on the profile so it's pre-filled next time
  await db.updateProfile(profile.id, {
    payout_method: parsed.data.method,
    payout_details: { destination: parsed.data.methodDetails },
  });

  const payout = await db.createPayoutRequest({
    affiliateId: profile.id,
    method: parsed.data.method,
    methodDetails: { destination: parsed.data.methodDetails },
  });
  if (!payout) {
    // balance moved between the check above and the atomic claim (reversal,
    // another concurrent request, etc.) — rare, but tell the truth instead
    // of pretending it worked.
    throw badRequest('nothing_available', 'Nothing was available to cash out — please refresh and try again.');
  }

  return ok(
    {
      payout: {
        id: payout.id,
        amountCents: payout.amount_cents,
        status: payout.status,
        method: payout.method,
        requestedAt: payout.requested_at,
      },
    },
    201,
  );
});
