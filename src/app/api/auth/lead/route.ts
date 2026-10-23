import { NextResponse } from 'next/server';
import { issueSession } from '@/server/auth/session';
import { getDb } from '@/server/db';
import { clientIp, userAgent } from '@/server/http';
import { profileIdFromLeadToken } from '@/server/services/magic-link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const safeRef = (v: string | null) => (v && /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : '');

/**
 * GET /api/auth/lead?t=...&ref=CODE — the link inside the follow-up emails.
 *  - a FREE member is signed in (no password) and lands in their free account, where
 *    "Harley's Story" shows the credited affiliate's Sales page
 *  - a member who has since paid is sent to the login page (the old link never signs a paid account in)
 *  - an expired/invalid link falls back to the public Sales page with the same affiliate
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = safeRef(url.searchParams.get('ref'));
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : '';

  const id = profileIdFromLeadToken(url.searchParams.get('t') ?? '');
  const profile = id ? await (await getDb()).getProfileById(id) : null;
  if (!profile) return NextResponse.redirect(new URL(`/activate${refQuery}`, url.origin));
  if (profile.account_type === 'paid') return NextResponse.redirect(new URL('/login', url.origin));

  await issueSession(profile.id, 'lead', { ip: clientIp(req), userAgent: userAgent(req) });
  return NextResponse.redirect(new URL(`/app${refQuery}`, url.origin));
}
