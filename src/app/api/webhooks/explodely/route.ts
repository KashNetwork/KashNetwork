import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/server/adapters';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/explodely — Explodely IPN endpoint.
 * Always returns 200 once the event is recorded (so Explodely doesn't retry-
 * storm on our processing bugs); unprocessed events are retried by the cron.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));

  const provider = getPaymentProvider();
  let signatureValid = false;
  try {
    provider.verifyWebhook(headers, raw);
    signatureValid = true;
  } catch (e) {
    // fake provider is a no-op; the real one throws. Log + still record so we
    // don't lose the event, but flag it.
    console.warn('[explodely-webhook] signature check failed:', (e as Error).message);
  }

  let event;
  try {
    event = provider.parseEvent(raw);
  } catch (e) {
    console.error('[explodely-webhook] unparseable payload:', (e as Error).message);
    return NextResponse.json({ error: 'unparseable' }, { status: 400 });
  }

  const result = await ingestPaymentEvent(event, signatureValid);
  return NextResponse.json({ ok: true, ...result });
}
