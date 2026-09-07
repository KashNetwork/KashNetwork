import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaymentEvent, PaymentEventType, PaymentProvider } from '@/shared';
import { config } from '../config';

/**
 * Explodely IPN adapter.
 *
 * ⚠️ The exact IPN payload + signature scheme are not documented to us yet
 * (docs/CLIENT-QUESTIONS.md §B). This maps against the field names CB-style
 * networks commonly use, with fallbacks, and verifies an HMAC-SHA256 of the
 * raw body. Confirm against a real IPN and tighten `parseEvent` / `verifyWebhook`
 * once we have Explodely access.
 */
export class ExplodelyProvider implements PaymentProvider {
  verifyWebhook(headers: Record<string, string>, rawBody: string): void {
    if (process.env.EXPLODELY_SKIP_VERIFY === '1') return;
    const secret = config.explodely.ipnSecret;
    if (!secret) throw new Error('explodely: IPN secret not configured');

    const provided =
      headers['x-explodely-signature'] ??
      headers['x-signature'] ??
      headers['explodely-signature'] ??
      '';
    if (!provided) throw new Error('explodely: missing signature header');

    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(provided.trim());
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error('explodely: signature mismatch');
    }
  }

  parseEvent(rawBody: string): PaymentEvent {
    const p = JSON.parse(rawBody) as Record<string, unknown>;
    const str = (...keys: string[]) => {
      for (const k of keys) {
        const v = p[k];
        if (typeof v === 'string' && v) return v;
        if (typeof v === 'number') return String(v);
      }
      return null;
    };

    const rawType = (str('transaction_type', 'txn_type', 'event', 'type', 'action') ?? '').toLowerCase();
    const type = mapType(rawType);

    const amount = str('amount', 'total', 'transaction_amount', 'price');
    const amountCents = amount ? Math.round(parseFloat(amount) * 100) : 0;

    const txn = str('transaction_id', 'txn_id', 'id', 'order_id');
    if (!txn) throw new Error('explodely: no transaction id in payload');

    return {
      type,
      externalTxnId: txn,
      externalSubId: str('subscription_id', 'sub_id', 'rebill_id', 'recurring_id'),
      customerEmail: (str('customer_email', 'email', 'buyer_email', 'ccustemail') ?? '').toLowerCase(),
      amountCents,
      currency: str('currency', 'ccurrency') ?? 'USD',
      affiliateRef: str('affiliate', 'aff_id', 'aff', 'ref', 'x_ref', 'passthrough', 'custom'),
      occurredAt: str('timestamp', 'date', 'created_at', 'transaction_date') ?? new Date().toISOString(),
      raw: p,
      dedupeKey: `${txn}:${type}`,
    };
  }

  async cancelSubscription(externalSubId: string, atPeriodEnd: boolean): Promise<void> {
    // TODO: real Explodely API call once we have API access. For now this is a
    // no-op — the user-facing cancel just marks our own subscription row and we
    // reconcile from the IPN when Explodely actually cancels.
    console.warn(
      `[explodely] cancelSubscription(${externalSubId}, atPeriodEnd=${atPeriodEnd}) — API call not implemented yet`,
    );
  }
}

function mapType(raw: string): PaymentEventType {
  if (/sale|initial|trial|new.?order|purchase/.test(raw)) return 'trial_started';
  if (/rebill|renewal|recurring|subscription.?payment/.test(raw)) return 'rebill_succeeded';
  if (/activat/.test(raw)) return 'subscription_activated';
  if (/decline|failed|failure|nsf/.test(raw)) return 'rebill_failed';
  if (/refund/.test(raw)) return 'refunded';
  if (/chargeback|dispute|cb/.test(raw)) return 'chargeback';
  if (/cancel.?request|cancellation.?request/.test(raw)) return 'cancel_requested';
  if (/cancel|terminat|expire/.test(raw)) return 'subscription_cancelled';
  if (/reactivat|resume|uncancel/.test(raw)) return 'reactivated';
  return 'rebill_succeeded';
}
