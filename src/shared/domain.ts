// Domain enums / constants. Mirror supabase/migrations/0001_initial_schema.sql.

export const ACCOUNT_TYPE = ['free', 'paid'] as const;
export type AccountType = (typeof ACCOUNT_TYPE)[number];

export const FREE_VARIANT = ['lead', 'downgraded'] as const;
export type FreeVariant = (typeof FREE_VARIANT)[number];

export const USER_ROLE = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLE)[number];

export const SUBSCRIPTION_STATE = [
  'trialing', 'active', 'past_due', 'cancelling', 'cancelled', 'expired',
] as const;
export type SubscriptionState = (typeof SUBSCRIPTION_STATE)[number];

export const COMMISSION_STATUS = [
  'pending', 'available', 'requested', 'paid', 'reversed', 'rejected',
] as const;
export type CommissionStatus = (typeof COMMISSION_STATUS)[number];

export const COMMISSION_KIND = ['trial', 'recurring'] as const;
export type CommissionKind = (typeof COMMISSION_KIND)[number];

export const PAYOUT_STATUS = ['requested', 'approved', 'paid', 'rejected'] as const;
export type PayoutStatus = (typeof PAYOUT_STATUS)[number];

export const REFERRAL_STATUS = ['trial', 'active', 'cancelled', 'refunded'] as const;
export type ReferralStatus = (typeof REFERRAL_STATUS)[number];

export const CLICK_LINK_KIND = ['landing', 'sales', 'checkout'] as const;
export type ClickLinkKind = (typeof CLICK_LINK_KIND)[number];

// --- money constants (NOT client-confirmed — see docs/CLIENT-QUESTIONS.md) ---
export const MONEY = {
  trialPriceCents: 100,
  monthlyPriceCents: 4700,
  affiliateTrialCents: 0,
  affiliateRecurringCents: 3000,
  adminTrialCents: 100,
  adminRecurringCents: 1700,
} as const;

export const DEFAULTS = {
  commissionHoldDays: 30,
  attributionWindowDays: 30,
  payoutMinCents: 5000,
} as const;

// funnel paths
export const FUNNEL_PATH: Record<ClickLinkKind, string> = {
  landing: '/trial',
  sales: '/activate',
  checkout: '/secure-checkout',
};

// video gate timestamps (seconds)
export const VIDEO_GATE = { emailGateAt: 113, contentRevealAt: 215 } as const;
