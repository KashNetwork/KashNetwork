import { randomUUID } from 'node:crypto';
import type { PaymentEvent, PaymentEventType } from '@/shared';
import { badRequest, ok, readJson, route } from '@/server/http';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: PaymentEventType[] = [
  'trial_started',
  'subscription_activated',
  'rebill_succeeded',
  'rebill_failed',
  'refunded',
  'chargeback',
  'cancel_requested',
  'subscription_cancelled',
  'reactivated',
];

/**
 * DEV ONLY — simulate an Explodely IPN so the whole payment/affiliate/commission
 * flow can be exercised without Explodely credentials.
 *
 *   POST /api/dev/sim-payment
 *   { "type": "trial_started", "email": "x@y.com", "ref": "CODE?",
 *     "subId": "sub_1?", "txnId": "txn_1?", "amountCents": 100? }
 */
export const POST = route(async (req) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== '1') {
    throw badRequest('disabled', 'dev routes are disabled in production');
  }
  const body = await readJson<{
    type?: string;
    email?: string;
    ref?: string;
    subId?: string;
    txnId?: string;
    amountCents?: number;
  }>(req);

  if (!body.type || !TYPES.includes(body.type as PaymentEventType)) {
    throw badRequest('bad_type', `type must be one of: ${TYPES.join(', ')}`);
  }
  if (!body.email) throw badRequest('bad_email', 'email is required');

  const type = body.type as PaymentEventType;
  const txnId = body.txnId ?? `sim_txn_${randomUUID().slice(0, 8)}`;
  const subId = body.subId ?? `sim_sub_${body.email}`;
  const defaultAmount =
    type === 'trial_started' ? 100 : type === 'rebill_failed' ? 0 : 4700;

  const event: PaymentEvent = {
    type,
    externalTxnId: txnId,
    externalSubId: subId,
    customerEmail: body.email.toLowerCase(),
    amountCents: body.amountCents ?? defaultAmount,
    currency: 'USD',
    affiliateRef: body.ref ?? null,
    occurredAt: new Date().toISOString(),
    raw: { simulated: true, ...body },
    dedupeKey: `${txnId}:${type}`,
  };

  const result = await ingestPaymentEvent(event, true);
  return ok({ event, result });
});
