import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { parseInboundEmail } from '@/server/adapters/inbound-email';
import { config } from '@/server/config';
import { getDb } from '@/server/db';
import { handleInboundEmail, stopForBadAddress } from '@/server/services/ai-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function secretMatches(given: string | null): boolean {
  const expected = config.secrets.inboundEmail;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/webhooks/inbound-email?secret=...   (or header x-inbound-secret)
 * Replies to sequence emails and mail to support@ land here. Always closed
 * unless INBOUND_EMAIL_SECRET is set.
 */
export async function POST(req: Request) {
  if (!config.secrets.inboundEmail) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }
  const url = new URL(req.url);
  const given = req.headers.get('x-inbound-secret') ?? url.searchParams.get('secret');
  if (!secretMatches(given)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const raw = await req.json().catch(() => null);

  // delivery problems reported by the email provider: stop emailing that address
  if (raw && (raw.type === 'email.bounced' || raw.type === 'email.complained' || raw.type === 'email.suppressed' || raw.type === 'email.failed')) {
    const stopped = await stopForBadAddress(await getDb(), raw);
    return NextResponse.json({ ok: true, action: 'delivery_problem', stopped });
  }

  let mail;
  try {
    mail = await parseInboundEmail(raw);
  } catch (e) {
    return NextResponse.json({ error: 'bad_payload', message: (e as Error).message }, { status: 400 });
  }

  try {
    const result = await handleInboundEmail(await getDb(), mail);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    // 200 would hide a real failure; 500 lets the provider retry
    console.error('[inbound-email] failed:', (e as Error).message);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
