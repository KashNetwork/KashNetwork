import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config';
import type { Repo } from '../db/repo';

// Signed, no-login unsubscribe links for the lead sequence. The token is the
// profile id plus an HMAC of it, so a link can't be forged for someone else.
function secret(): string {
  return config.secrets.unsubscribe || config.secrets.cron || 'dev-only-unsubscribe-secret';
}

const sign = (profileId: string) => createHmac('sha256', secret()).update(profileId).digest('base64url');

export function unsubscribeToken(profileId: string): string {
  return `${profileId}.${sign(profileId)}`;
}

export function profileIdFromToken(token: string): string | null {
  const [id, sig] = token.split('.');
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

export function unsubscribeUrl(profileId: string): string {
  return `${config.publicSiteUrl}/api/unsubscribe?t=${unsubscribeToken(profileId)}`;
}

/** Stops the drip and the AI thread for this lead. Safe to call repeatedly. */
export async function unsubscribeProfile(repo: Repo, profileId: string): Promise<boolean> {
  const profile = await repo.getProfileById(profileId);
  if (!profile) return false;
  const state = await repo.getLeadStateByProfile(profileId);
  if (state && state.sequence_status === 'active') {
    await repo.updateLeadState(profileId, { sequence_status: 'stopped', next_send_at: null });
  }
  await repo.setAiThreadActive(profileId, false);
  return true;
}
