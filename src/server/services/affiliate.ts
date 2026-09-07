import { randomBytes } from 'node:crypto';
import { CLICK_LINK_KIND } from '@/shared';
import { config } from '../config';
import type { ProfileRow, Repo } from '../db/index';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Unique, human-typeable affiliate code. */
export async function generateAffiliateCode(repo: Repo): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const bytes = randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i]! % ALPHABET.length];
    if (!(await repo.getProfileByAffiliateCode(code))) return code;
  }
  throw new Error('could not generate a unique affiliate code');
}

/** The admin profile — fallback affiliate for unattributed / reassigned referrals. */
export async function getAdminProfile(repo: Repo): Promise<ProfileRow> {
  const byCode = await repo.getProfileByAffiliateCode(config.adminAffiliateCode);
  if (byCode?.role === 'admin') return byCode;
  // fall back to any admin
  const overview = await repo.adminOverview();
  void overview;
  const admin = await repo.getProfileByEmail(config.seedAdmin.email || 'admin@kash.network');
  if (admin?.role === 'admin') return admin;
  throw new Error('no admin profile found — cannot attribute referrals');
}

/** Turn a paid user into an active affiliate (idempotent). */
export async function activateAffiliate(repo: Repo, profile: ProfileRow): Promise<ProfileRow> {
  const code = profile.affiliate_code ?? (await generateAffiliateCode(repo));
  const updated = await repo.updateProfile(profile.id, {
    is_affiliate: true,
    affiliate_code: code,
    free_variant: 'lead',
  });
  await repo.ensureReferralLinks(profile.id, [...CLICK_LINK_KIND]);
  await repo.setReferralLinksActive(profile.id, true);
  return updated;
}

/**
 * Downgrade: strip affiliate status, deactivate links, move this affiliate's
 * downline to the admin, and forfeit their not-yet-paid commissions.
 */
export async function deactivateAffiliate(
  repo: Repo,
  profile: ProfileRow,
  reason: string,
): Promise<void> {
  const admin = await getAdminProfile(repo);
  await repo.setReferralLinksActive(profile.id, false);
  const moved = await repo.reassignReferralsToAdmin(profile.id, admin.id);
  const forfeited = await repo.forfeitUnpaidCommissions(profile.id, reason);
  await repo.updateProfile(profile.id, {
    is_affiliate: false,
    admin_reassigned: moved > 0,
    account_type: 'free',
    free_variant: 'downgraded',
  });
  console.log(
    `[affiliate] deactivated ${profile.email}: ${moved} referrals -> admin, ${forfeited} commissions forfeited (${reason})`,
  );
}
