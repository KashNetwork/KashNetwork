import type { ProfileRow } from '../db/index';
import { config } from '../config';

export type TabKey =
  | 'harleys_story'
  | 'dashboard'
  | 'commissions'
  | 'buy_traffic'
  | 'support'
  | 'profile'
  | 'cancel_subscription'
  | 'customers'
  | 'payouts'
  | 'admin';

export interface MeResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: 'user' | 'admin';
  accountType: 'free' | 'paid';
  freeVariant: 'lead' | 'downgraded';
  isAffiliate: boolean;
  hasPassword: boolean;
  affiliate: {
    code: string;
    links: { landing: string; sales: string; checkout: string };
  } | null;
  tabs: TabKey[];
}

function affiliateLinks(code: string) {
  const base = config.publicSiteUrl.replace(/\/$/, '');
  return {
    landing: `${base}/trial?ref=${encodeURIComponent(code)}`,
    sales: `${base}/activate?ref=${encodeURIComponent(code)}`,
    checkout: `${base}/secure-checkout?ref=${encodeURIComponent(code)}`,
  };
}

export function tabsFor(profile: ProfileRow): TabKey[] {
  if (profile.role === 'admin')
    return ['dashboard', 'customers', 'payouts', 'support', 'profile', 'admin'];
  if (profile.account_type === 'paid')
    return ['dashboard', 'commissions', 'buy_traffic', 'support', 'profile', 'cancel_subscription'];
  return ['harleys_story'];
}

export function presentMe(profile: ProfileRow): MeResponse {
  const affiliateActive = profile.is_affiliate && profile.affiliate_code != null;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    accountType: profile.account_type,
    freeVariant: profile.free_variant,
    isAffiliate: profile.is_affiliate,
    hasPassword: profile.password_hash != null,
    affiliate: affiliateActive
      ? { code: profile.affiliate_code!, links: affiliateLinks(profile.affiliate_code!) }
      : null,
    tabs: tabsFor(profile),
  };
}
