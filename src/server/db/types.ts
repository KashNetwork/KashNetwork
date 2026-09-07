import type {
  AccountType,
  ClickLinkKind,
  CommissionKind,
  CommissionStatus,
  FreeVariant,
  PaymentEventType,
  ReferralStatus,
  SubscriptionState,
  UserRole,
} from '@/shared';

export type SessionKind = 'lead' | 'user';

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  password_hash: string | null;
  role: UserRole;
  account_type: AccountType;
  free_variant: FreeVariant;
  is_affiliate: boolean;
  affiliate_code: string | null;
  referred_by_affiliate_id: string | null;
  admin_reassigned: boolean;
  signup_ip: string | null;
  signup_user_agent: string | null;
  signup_fingerprint: string | null;
  email_verified_at: string | null;
  payout_method: string | null;
  payout_details: unknown;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  profile_id: string;
  token_hash: string;
  kind: SessionKind;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export interface EmailChangeRow {
  id: string;
  profile_id: string;
  new_email: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
}

export interface ClickRow {
  id: string;
  affiliate_id: string;
  link_kind: 'landing' | 'sales' | 'checkout';
  visitor_id: string | null;
  ip: string | null;
  user_agent: string | null;
  referer: string | null;
  landing_path: string | null;
  created_at: string;
}

export interface SupportTicketRow {
  id: string;
  profile_id: string | null;
  from_email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  location: 'landing' | 'sales' | 'both';
  member_label: string;
  message: string;
  relative_time_text: string | null;
  weight: number;
  active: boolean;
  created_at: string;
}

export interface NewProfile {
  email: string;
  full_name?: string | null;
  password_hash?: string | null;
  role?: UserRole;
  account_type?: AccountType;
  free_variant?: FreeVariant;
  referred_by_affiliate_id?: string | null;
  signup_ip?: string | null;
  signup_user_agent?: string | null;
  signup_fingerprint?: string | null;
  email_verified_at?: string | null;
}

/* ------------------------------------------------------------ M2: payments */

export interface SubscriptionRow {
  id: string;
  profile_id: string;
  external_sub_id: string | null;
  external_product_id: string | null;
  state: SubscriptionState;
  price_cents: number;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  reactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEventRow {
  id: string;
  provider: string;
  event_type: PaymentEventType;
  external_txn_id: string | null;
  external_sub_id: string | null;
  customer_email: string | null;
  amount_cents: number;
  currency: string;
  affiliate_ref: string | null;
  occurred_at: string;
  raw: unknown;
  signature_valid: boolean;
  dedupe_key: string;
  processed_at: string | null;
  processing_error: string | null;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  affiliate_id: string;
  referred_profile_id: string;
  status: ReferralStatus;
  first_click_at: string | null;
  last_click_at: string | null;
  attributed_at: string;
  attribution_locked: boolean;
  attribution_source: string | null;
  created_at: string;
}

export interface CommissionRow {
  id: string;
  affiliate_id: string;
  referral_id: string;
  subscription_id: string | null;
  payment_event_id: string | null;
  amount_cents: number;
  kind: CommissionKind;
  status: CommissionStatus;
  hold_until: string;
  available_at: string | null;
  reversed_at: string | null;
  reversal_reason: string | null;
  payout_id: string | null;
  created_at: string;
}

export interface FraudFlagInput {
  profileId: string | null;
  type:
    | 'self_referral'
    | 'dup_account'
    | 'velocity'
    | 'disposable_email'
    | 'ip_match'
    | 'payment_fingerprint'
    | 'attribution_conflict';
  severity?: 'low' | 'medium' | 'high';
  details?: unknown;
  autoAction?: string | null;
}

export interface AffiliateStats {
  totalClicks: number;
  totalReferrals: number;
  totalCommissionsCents: number; // paid + available + requested
  pendingCents: number; // in 30-day hold
  availableCents: number; // ready to withdraw
  thisMonthCents: number; // commissions created this calendar month
}

export interface AdminUserListParams {
  filter: 'all' | 'free_leads' | 'active_paid' | 'cancelled';
  q?: string;
  page: number;
  pageSize: number;
}

export interface AdminUserListRow {
  id: string;
  email: string;
  full_name: string | null;
  account_type: AccountType;
  free_variant: FreeVariant;
  role: UserRole;
  is_affiliate: boolean;
  affiliate_code: string | null;
  created_at: string;
  referral_count: number;
  total_earned_cents: number;
}
