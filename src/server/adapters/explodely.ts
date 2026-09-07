import { timingSafeEqual } from 'node:crypto';
import type { PaymentEvent, PaymentEventType, PaymentProvider } from '@/shared';
import { config } from '../config';

/**
 * Explodely IPN adapter — built against https://docs.explodely.com.
 *
 * IPN is form-encoded (POST body) or a query string (GET), not JSON. Explodely
 * does NOT sign IPNs, so authenticity relies on the IPN URL being secret: we
 * append `?token=<EXPLODELY_IPN_TOKEN>` to the URL configured in Explodely and
 * reject anything without it. Belt-and-braces: commissions sit in a 30-day hold
 * with manual admin approval, so a spoofed IPN can't move money on its own.
 *
 * Event mapping:
 *   type=sale, no `rebill`   -> trial_started       (the $1 initial sale)
 *   type=sale, rebill=yes    -> rebill_succeeded    (a $47 renewal)
 *   type=refund              -> refunded            (amount is negative)
 *   type=rebillcancel        -> subscription_cancelled
 *
 * Not emitted by IPN (Webhooks only): declines (rebill_failed), chargebacks.
 * The cron backstop downgrades lapsed subscriptions.
 *
 * The "subscription id" is Explodely's initial-sale `orderid` (= `mainorderid`
 * on every rebill / cancel).
 */
export class ExplodelyProvider implements PaymentProvider {
  /** Called by the route with the request URL's search params + the raw body. */
  verifyWebhook(headers: Record<string, string>, rawBody: string): void {
    void headers;
    if (process.env.EXPLODELY_SKIP_VERIFY === '1') return;
    const expected = config.explodely.ipnSecret;
    if (!expected) throw new Error('explodely: EXPLODELY_IPN_SECRET not configured');

    // the token can arrive on the query string or in the body
    const params = new URLSearchParams(rawBody.includes('?') ? rawBody.split('?')[1] : rawBody);
    const provided = params.get('token') ?? params.get('key') ?? '';
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error('explodely: IPN token mismatch');
    }
  }

  parseEvent(rawBody: string): PaymentEvent {
    const p = new URLSearchParams(rawBody.includes('?') ? rawBody.split('?')[1] : rawBody);
    const s = (k: string) => p.get(k)?.trim() || null;

    const rawType = (s('type') ?? '').toLowerCase();
    const isRebill = (s('rebill') ?? '').toLowerCase() === 'yes';
    const type = mapType(rawType, isRebill);

    // subscription identity: initial sale's orderid
    const orderId = s('orderid');
    const mainOrderId = s('mainorderid') ?? orderId;

    const amountRaw = s('amount');
    const amountCents = amountRaw ? Math.round(Math.abs(parseFloat(amountRaw)) * 100) : 0;

    // our affiliate code — passed as ?tpa=CODE, comes back as "tpa_CODE"
    const affRaw = s('affiliate') ?? s('custom1');
    const affiliateRef = affRaw?.startsWith('tpa_') ? affRaw.slice(4) : affRaw;

    const txn = orderId ?? mainOrderId ?? s('saletimestamp') ?? String(Date.now());

    return {
      type,
      externalTxnId: txn,
      externalSubId: mainOrderId,
      customerEmail: (s('customerEmail') ?? '').toLowerCase(),
      amountCents,
      currency: 'USD',
      affiliateRef: affiliateRef ?? null,
      occurredAt: parseTime(
        s('saletimedate') ?? s('refundtimedate') ?? s('canceltimedate'),
        s('saletimestamp') ?? s('refundtimestamp') ?? s('canceltimestamp'),
      ),
      raw: Object.fromEntries(p.entries()),
      dedupeKey: `${txn}:${type}`,
    };
  }

  async cancelSubscription(externalSubId: string, _atPeriodEnd: boolean): Promise<void> {
    if (!config.explodely.username || !config.explodely.apiKey) {
      console.warn('[explodely] cancelSubscription skipped — no API username/key');
      return;
    }
    const url = new URL('https://explodely.com/api/v1/rebill');
    url.searchParams.set('username', config.explodely.username);
    url.searchParams.set('apikey', config.explodely.apiKey);
    url.searchParams.set('apiaction', 'cancelrebill');
    url.searchParams.set('mainorderid', externalSubId);
    const res = await fetch(url, { method: 'GET' });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.error) throw new Error(`explodely cancelrebill: ${String(body.error)}`);
  }
}

function mapType(raw: string, isRebill: boolean): PaymentEventType {
  if (raw === 'sale') return isRebill ? 'rebill_succeeded' : 'trial_started';
  if (raw === 'refund') return 'refunded';
  if (raw === 'rebillcancel') return 'subscription_cancelled';
  if (raw === 'chargeback') return 'chargeback';
  if (raw === 'decline') return 'rebill_failed';
  return isRebill ? 'rebill_succeeded' : 'trial_started';
}

/** Explodely time format: "HH:MM:SS DD-MMM-YYYY", plus a machine timestamp. */
function parseTime(timedate: string | null, timestamp: string | null): string {
  if (timestamp && /^\d{9,13}$/.test(timestamp)) {
    const n = Number(timestamp);
    return new Date(n < 1e12 ? n * 1000 : n).toISOString();
  }
  if (timedate) {
    const m = /^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(timedate);
    if (m) {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mon = months.indexOf(m[5]!.toLowerCase());
      if (mon >= 0) {
        return new Date(
          Date.UTC(+m[6]!, mon, +m[4]!, +m[1]!, +m[2]!, +m[3]!),
        ).toISOString();
      }
    }
  }
  return new Date().toISOString();
}
