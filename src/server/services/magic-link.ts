import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config';

// Signed, expiring sign-in links (welcome email + "email me a sign-in link").
// Token = profileId.expiresAtMs.signature — a bearer link, so keep TTLs short.
function secret(): string {
  return config.secrets.unsubscribe || config.secrets.cron || 'dev-only-unsubscribe-secret';
}

const sign = (payload: string) =>
  createHmac('sha256', secret()).update(`magic-login:${payload}`).digest('base64url');

export const WELCOME_TTL_MS = 3 * 24 * 60 * 60 * 1000;
export const SIGNIN_TTL_MS = 30 * 60 * 1000;

export function magicToken(profileId: string, ttlMs: number, now = Date.now()): string {
  const payload = `${profileId}.${now + ttlMs}`;
  return `${payload}.${sign(payload)}`;
}

export function profileIdFromMagicToken(token: string, now = Date.now()): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts as [string, string, string];
  const expected = Buffer.from(sign(`${id}.${exp}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!Number.isFinite(Number(exp)) || Number(exp) < now) return null;
  return id;
}

/** Free-lead links in the follow-up emails stay valid for the whole 30-day sequence (plus a margin). */
export const LEAD_LINK_TTL_MS = 35 * 24 * 60 * 60 * 1000;

const signLead = (payload: string) =>
  createHmac('sha256', secret()).update(`lead-email:${payload}`).digest('base64url');

export function leadToken(profileId: string, now = Date.now()): string {
  const payload = `${profileId}.${now + LEAD_LINK_TTL_MS}`;
  return `${payload}.${signLead(payload)}`;
}

export function profileIdFromLeadToken(token: string, now = Date.now()): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts as [string, string, string];
  const expected = Buffer.from(signLead(`${id}.${exp}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!Number.isFinite(Number(exp)) || Number(exp) < now) return null;
  return id;
}

/**
 * The link inside a follow-up email for a free member: signs them into their free
 * account and opens "Harley's Story" showing this affiliate's Sales page.
 */
export function leadAppLink(profileId: string, affiliateCode: string): string {
  return `${config.publicSiteUrl}/api/auth/lead?t=${leadToken(profileId)}&ref=${encodeURIComponent(affiliateCode)}`;
}

export function magicLinkUrl(profileId: string, ttlMs: number): string {
  return `${config.publicSiteUrl}/api/auth/magic?t=${magicToken(profileId, ttlMs)}`;
}
