import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/server/adapters';
import { getDb } from '@/server/db';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Explodely IPN endpoint. Explodely can send GET or POST, form-encoded.
 * We combine the query string + body so `token`, `orderid`, `type` etc. are all
 * visible regardless. Always 200 once recorded so Explodely doesn't retry-storm;
 * unprocessed events are retried by the cron.
 */
/** Keep the last 10 calls (accepted or not) so "is Explodely reaching us?" can be answered from the database. */
async function logHit(entry: Record<string, unknown>) {
  try {
    const db = await getDb();
    const prev = (await db.getSetting<unknown[]>('ipn_recent_hits')) ?? [];
    await db.setSetting('ipn_recent_hits', [{ at: new Date().toISOString(), ...entry }, ...prev].slice(0, 10));
  } catch {
    /* logging must never break the IPN */
  }
}

async function handle(req: Request) {
  const url = new URL(req.url);
  const bodyText = req.method === 'POST' ? await req.text() : '';
  // one string the adapter can parse either way
  const combined = [url.searchParams.toString(), bodyText].filter(Boolean).join('&');
  const raw = `?${combined}`;

  const fields = [...new URLSearchParams(combined).keys()].filter((k) => k !== 'token').slice(0, 30);
  const hit = { method: req.method, fields, type: new URLSearchParams(combined).get('type') };

  const provider = getPaymentProvider();
  let signatureValid = false;
  try {
    provider.verifyWebhook({}, raw);
    signatureValid = true;
  } catch (e) {
    console.warn('[explodely-ipn] token check failed:', (e as Error).message);
    await logHit({ ...hit, outcome: 'rejected_token', hasToken: new URLSearchParams(combined).has('token') });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let event;
  try {
    event = provider.parseEvent(raw);
  } catch (e) {
    console.error('[explodely-ipn] unparseable:', (e as Error).message, combined.slice(0, 300));
    await logHit({ ...hit, outcome: 'unparseable' });
    return NextResponse.json({ error: 'unparseable' }, { status: 400 });
  }

  const result = await ingestPaymentEvent(event, signatureValid);
  await logHit({ ...hit, outcome: 'accepted' });
  return NextResponse.json({ ok: true, ...result });
}

export const POST = handle;
export const GET = handle;
