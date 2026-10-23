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

export const PAYOUT_METHOD = ['paypal', 'cashapp', 'bank', 'other'] as const;
export type PayoutMethod = (typeof PAYOUT_METHOD)[number];

export const REFERRAL_STATUS = ['trial', 'active', 'cancelled', 'refunded'] as const;
export type ReferralStatus = (typeof REFERRAL_STATUS)[number];

export const CLICK_LINK_KIND = ['landing', 'sales', 'checkout'] as const;
export type ClickLinkKind = (typeof CLICK_LINK_KIND)[number];

export const SEQUENCE_STATUS = ['active', 'converted', 'completed', 'stopped'] as const;
export type SequenceStatus = (typeof SEQUENCE_STATUS)[number];

export const EMAIL_DIRECTION = ['outbound', 'inbound'] as const;
export type EmailDirection = (typeof EMAIL_DIRECTION)[number];

// --- money constants (client-confirmed in writing, 2026-09-25) ---
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
  payoutMinCents: 3000,
} as const;

// funnel paths
export const FUNNEL_PATH: Record<ClickLinkKind, string> = {
  landing: '/trial',
  sales: '/activate',
  checkout: '/secure-checkout',
};

// video gate timestamps (seconds)
// emailGateAt: the pause has to land in the silent gap between the spoken
// "...in less than 24 hours" and the "BOOM" sound. Measured from the audio
// track (ffmpeg silencedetect, -30dB): "hours" ends ~114.12s, "boom" starts
// ~114.56s — a 0.44s gap. 114.34s is its center; leaves ~0.2s of margin on
// each side so audio-output latency (heard audio trails currentTime by
// ~50-150ms) still lets the end of "hours" play out fully but never leaks
// the front of "boom". (An earlier 114.46s target was inside the gap too,
// but was pausing late — see the requestAnimationFrame polling in VideoGate.)
export const VIDEO_GATE = { emailGateAt: 114.34, contentRevealAt: 215 } as const;
