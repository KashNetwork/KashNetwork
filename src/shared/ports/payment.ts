// PaymentProvider port (Explodely). See docs/EXTERNAL-INTEGRATIONS.md.

export const PAYMENT_EVENT_TYPE = [
  'trial_started',
  'subscription_activated',
  'rebill_succeeded',
  'rebill_failed',
  'refunded',
  'chargeback',
  'cancel_requested',
  'subscription_cancelled',
  'reactivated',
] as const;
export type PaymentEventType = (typeof PAYMENT_EVENT_TYPE)[number];

export interface PaymentEvent {
  type: PaymentEventType;
  externalTxnId: string;
  externalSubId: string | null;
  customerEmail: string;
  amountCents: number;
  currency: string;
  /** our passthrough affiliate code, if Explodely returns it on this event */
  affiliateRef: string | null;
  occurredAt: string; // ISO
  raw: unknown;
  /** `${externalTxnId}:${type}` — makes ingestion idempotent */
  dedupeKey: string;
}

export interface TxnState {
  refunded: boolean;
  chargedBack: boolean;
}

export interface PaymentProvider {
  verifyWebhook(headers: Record<string, string>, rawBody: string): void;
  parseEvent(rawBody: string): PaymentEvent;
  cancelSubscription?(externalSubId: string, atPeriodEnd: boolean): Promise<void>;
  getTransactionState?(externalTxnId: string): Promise<TxnState>;
}
