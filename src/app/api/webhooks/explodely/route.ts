import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/server/adapters';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Explodely IPN endpoint. Explodely can send GET or POST, form-encoded.
 * We combine the query string + body so `token`, `orderid`, `type` etc. are all
 * visible regardless. Always 200 once recorded so Explodely doesn't retry-storm;
 * unprocessed events are retried by the cron.
 */
async function handle(req: Request) {
  const url = new URL(req.url);
  const bodyText = req.method === 'POST' ? await req.text() : '';
  // one string the adapter can parse either way
  const combined = [url.searchParams.toString(), bodyText].filter(Boolean).join('&');
  const raw = `?${combined}`;

  const provider = getPaymentProvider();
  let signatureValid = false;
  try {
    provider.verifyWebhook({}, raw);
    signatureValid = true;
  } catch (e) {
    console.warn('[explodely-ipn] token check failed:', (e as Error).message);
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let event;
  try {
    event = provider.parseEvent(raw);
  } catch (e) {
    console.error('[explodely-ipn] unparseable:', (e as Error).message, combined.slice(0, 300));
    return NextResponse.json({ error: 'unparseable' }, { status: 400 });
  }

  const result = await ingestPaymentEvent(event, signatureValid);
  return NextResponse.json({ ok: true, ...result });
}

export const POST = handle;
export const GET = handle;
