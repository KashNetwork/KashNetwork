import type { PaymentEvent } from '@/shared';
import { getDb } from '../db';
import { processPaymentEvent } from './payments';

/**
 * Record a normalised payment event (append-only, deduped) and run it through
 * the state machine. Safe to call twice with the same event.
 */
export async function ingestPaymentEvent(
  event: PaymentEvent,
  signatureValid: boolean,
): Promise<{ status: 'processed' | 'duplicate' | 'error'; detail: string }> {
  const db = await getDb();

  const existing = await db.getPaymentEventByDedupeKey(event.dedupeKey);
  if (existing?.processed_at) {
    return { status: 'duplicate', detail: existing.processing_error ?? 'already processed' };
  }

  const row =
    existing ??
    (await db.recordPaymentEvent({
      provider: 'explodely',
      eventType: event.type,
      externalTxnId: event.externalTxnId,
      externalSubId: event.externalSubId,
      customerEmail: event.customerEmail || null,
      amountCents: event.amountCents,
      currency: event.currency,
      affiliateRef: event.affiliateRef,
      occurredAt: event.occurredAt,
      raw: event.raw,
      signatureValid,
      dedupeKey: event.dedupeKey,
    }));

  try {
    const detail = await processPaymentEvent(db, event, row.id);
    await db.markPaymentEventProcessed(row.id, null);
    return { status: 'processed', detail };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.markPaymentEventProcessed(row.id, message);
    console.error('[webhook-ingest] processing failed', message);
    return { status: 'error', detail: message };
  }
}
