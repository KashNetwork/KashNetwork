import type { ProfileRow, Repo } from '../db/index';

/**
 * Lightweight safeguards. Real fraud scoring is Milestone 4; this covers the
 * cases that touch money in M2: self-referral and duplicate/velocity signals.
 * Everything here only *flags* + optionally holds — it never silently deletes.
 */

export async function flagSelfReferral(
  repo: Repo,
  purchaser: ProfileRow,
  attemptedAffiliateId: string,
): Promise<void> {
  await repo.createFraudFlag({
    profileId: purchaser.id,
    type: 'self_referral',
    severity: 'high',
    details: { attemptedAffiliateId },
    autoAction: 'attribution_dropped_to_admin',
  });
}

/** Same normalised email already has an account (dot/plus tricks on gmail). */
export function normalizeEmail(email: string): string {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!domain) return email.trim().toLowerCase();
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${(local ?? '').split('+')[0]!.replace(/\./g, '')}@gmail.com`;
  }
  return `${(local ?? '').split('+')[0]}@${domain}`;
}

export async function flagChargeback(
  repo: Repo,
  profile: ProfileRow,
  affiliateId: string | null,
): Promise<void> {
  await repo.createFraudFlag({
    profileId: profile.id,
    type: 'payment_fingerprint',
    severity: 'high',
    details: { reason: 'chargeback', affiliateId },
    autoAction: 'commissions_reversed',
  });
}
