import type {
  AccountType,
  FreeVariant,
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
