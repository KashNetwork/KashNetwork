import { DEFAULTS } from '@/shared';
import type { ProfileRow, Repo } from '../db/index';
import { getAdminProfile } from './affiliate';

export interface AttributionResult {
  affiliateId: string;
  source: 'ref_code' | 'signup_ref' | 'last_click' | 'admin_fallback';
  selfReferral: boolean;
}

/**
 * 30-day last-click attribution. Resolves who gets credit for a purchase.
 *
 * Priority: explicit ref code on the purchase → the affiliate stored on the
 * profile at signup → the most recent affiliate click for this visitor within
 * the window → admin fallback.
 *
 * A currently-inactive affiliate (cancelled / downgraded) never gets credit —
 * that falls through to admin.
 */
export async function resolveAttribution(
  repo: Repo,
  purchaser: ProfileRow,
  input: { refCode?: string | null; visitorId?: string | null },
): Promise<AttributionResult> {
  const windowDays = DEFAULTS.attributionWindowDays;

  const activeAffiliate = async (p: ProfileRow | null) =>
    p && p.is_affiliate && p.account_type === 'paid' && p.id !== purchaser.id ? p : null;

  // 1. explicit ref code passed through with the purchase
  if (input.refCode) {
    const byCode = await repo.getProfileByAffiliateCode(input.refCode);
    if (byCode?.id === purchaser.id) {
      const admin = await getAdminProfile(repo);
      return { affiliateId: admin.id, source: 'admin_fallback', selfReferral: true };
    }
    const ok = await activeAffiliate(byCode);
    if (ok) return { affiliateId: ok.id, source: 'ref_code', selfReferral: false };
  }

  // 2. affiliate recorded on the profile when they entered their email
  if (purchaser.referred_by_affiliate_id) {
    const bySignup = await repo.getProfileById(purchaser.referred_by_affiliate_id);
    if (bySignup && bySignup.id === purchaser.id) {
      const admin = await getAdminProfile(repo);
      return { affiliateId: admin.id, source: 'admin_fallback', selfReferral: true };
    }
    const ok = await activeAffiliate(bySignup);
    if (ok) return { affiliateId: ok.id, source: 'signup_ref', selfReferral: false };
  }

  // 3. most recent affiliate click for this visitor
  if (input.visitorId) {
    const click = await repo.lastAttributableClick({
      visitorId: input.visitorId,
      windowDays,
    });
    if (click) {
      const ok = await activeAffiliate(await repo.getProfileById(click.affiliate_id));
      if (ok) return { affiliateId: ok.id, source: 'last_click', selfReferral: false };
      if (click.affiliate_id === purchaser.id) {
        const admin = await getAdminProfile(repo);
        return { affiliateId: admin.id, source: 'admin_fallback', selfReferral: true };
      }
    }
  }

  // 4. no valid affiliate → admin
  const admin = await getAdminProfile(repo);
  return { affiliateId: admin.id, source: 'admin_fallback', selfReferral: false };
}
