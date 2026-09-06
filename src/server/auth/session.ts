import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { config } from '@/server/config';
import { getDb } from '@/server/db';
import type { ProfileRow, SessionKind, SessionRow } from '@/server/db';

export const SESSION_COOKIE = 'kn_session';
export const VISITOR_COOKIE = 'kn_vid';
export const REF_COOKIE = 'kn_ref';

const USER_TTL_S = 30 * 24 * 60 * 60;
const LEAD_TTL_S = config.leadSessionTtlDays * 24 * 60 * 60;

export const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

export interface AuthedSession {
  session: SessionRow;
  profile: ProfileRow;
}

/** Create a session row and set the cookie. Call from a route handler / action. */
export async function issueSession(
  profileId: string,
  kind: SessionKind,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const ttlS = kind === 'lead' ? LEAD_TTL_S : USER_TTL_S;
  await (await getDb()).createSession({
    profileId,
    tokenHash: sha256(token),
    kind,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
    expiresAt: new Date(Date.now() + ttlS * 1000).toISOString(),
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttlS,
  });
}

export async function currentSession(): Promise<AuthedSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const session = await db.getSessionByTokenHash(sha256(token));
  if (!session || session.revoked_at) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;
  const profile = await db.getProfileById(session.profile_id);
  if (!profile) return null;
  if (Date.now() - new Date(session.last_seen_at).getTime() > 60 * 60 * 1000) {
    await db.touchSession(session.id, new Date().toISOString());
  }
  return { session, profile };
}

export async function revokeCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const session = await (await getDb()).getSessionByTokenHash(sha256(token));
    if (session) await (await getDb()).revokeSession(session.id);
  }
  jar.delete(SESSION_COOKIE);
}

export async function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): Promise<void> {
  (await cookies()).set(name, value, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export async function getCookie(name: string): Promise<string | undefined> {
  return (await cookies()).get(name)?.value;
}
