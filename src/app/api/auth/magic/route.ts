import { NextResponse } from 'next/server';
import { issueSession } from '@/server/auth/session';
import { getDb } from '@/server/db';
import { clientIp, userAgent } from '@/server/http';
import { profileIdFromMagicToken } from '@/server/services/magic-link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/auth/magic?t=... — signs the person in from an emailed link, then opens the app. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = profileIdFromMagicToken(url.searchParams.get('t') ?? '');
  const profile = id ? await (await getDb()).getProfileById(id) : null;
  if (!profile) return NextResponse.redirect(new URL('/login?link=invalid', url.origin));

  await issueSession(profile.id, profile.account_type === 'paid' ? 'user' : 'lead', {
    ip: clientIp(req),
    userAgent: userAgent(req),
  });
  return NextResponse.redirect(new URL('/app?welcome=1', url.origin));
}
