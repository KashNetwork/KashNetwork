import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { config } from '../config.js';
import { getRepo } from '../db/index.js';
import type { ProfileRow, SessionKind, SessionRow } from '../db/index.js';

export const SESSION_COOKIE = 'kn_session';
export const VISITOR_COOKIE = 'kn_vid';
export const REF_COOKIE = 'kn_ref';

const USER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LEAD_TTL_MS = config.leadSessionTtlDays * 24 * 60 * 60 * 1000;

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

export interface AuthedSession {
  session: SessionRow;
  profile: ProfileRow;
}

export async function issueSession(
  res: Response,
  profileId: string,
  kind: SessionKind,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const ttl = kind === 'lead' ? LEAD_TTL_MS : USER_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl).toISOString();
  await getRepo().createSession({
    profileId,
    tokenHash: sha256(token),
    kind,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
    expiresAt,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttl,
  });
}

export async function resolveSession(token: string | undefined): Promise<AuthedSession | null> {
  if (!token) return null;
  const repo = getRepo();
  const session = await repo.getSessionByTokenHash(sha256(token));
  if (!session || session.revoked_at) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;
  const profile = await repo.getProfileById(session.profile_id);
  if (!profile) return null;
  // sliding touch (best-effort, at most once per hour)
  const lastSeen = new Date(session.last_seen_at).getTime();
  if (Date.now() - lastSeen > 60 * 60 * 1000) {
    await repo.touchSession(session.id, new Date().toISOString());
  }
  return { session, profile };
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  const session = await getRepo().getSessionByTokenHash(sha256(token));
  if (session) await getRepo().revokeSession(session.id);
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

export { sha256 };
