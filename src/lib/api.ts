export interface Me {
  id: string;
  email: string;
  fullName: string | null;
  role: 'user' | 'admin';
  accountType: 'free' | 'paid';
  freeVariant: 'lead' | 'downgraded';
  isAffiliate: boolean;
  hasPassword: boolean;
  affiliate: { code: string; links: { landing: string; sales: string; checkout: string } } | null;
  tabs: string[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? 'error',
      body?.message ?? `Request failed (${res.status})`,
    );
  }
  return body as T;
}

export const api = {
  me: () => req<{ me: Me }>('/me', { cache: 'no-store' }),
  submitLead: (email: string, ref?: string) =>
    req<{ me: Me; created: boolean }>('/leads', {
      method: 'POST',
      body: JSON.stringify({ email, ref }),
    }),
  login: (email: string, password: string) =>
    req<{ me: Me }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => req<{ ok: true }>('/auth/logout', { method: 'POST' }),
  setPassword: (newPassword: string, currentPassword?: string) =>
    req<{ ok: true }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ newPassword, currentPassword }),
    }),
  updateName: (fullName: string) =>
    req<{ me: Me }>('/me/profile', {
      method: 'PATCH',
      body: JSON.stringify({ fullName }),
    }),
  requestEmailChange: (newEmail: string) =>
    req<{ ok: true; pendingEmail: string }>('/auth/email-change', {
      method: 'POST',
      body: JSON.stringify({ newEmail }),
    }),
  submitSupport: (message: string, subject?: string) =>
    req<{ ok: true; ticketId: string }>('/support', {
      method: 'POST',
      body: JSON.stringify({ message, subject }),
    }),
  notifications: (location: 'landing' | 'sales') =>
    req<{ items: { id: string; label: string; message: string; time: string | null }[] }>(
      `/notifications?location=${location}`,
    ),
  trackClick: (ref: string, linkKind = 'landing', path?: string) =>
    req<{ ok: true; attributed: boolean }>('/track/click', {
      method: 'POST',
      body: JSON.stringify({ ref, linkKind, path }),
    }),
  requestSignInLink: (email: string) =>
    req<{ ok: true }>('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  adminOverview: () =>
    req<{
      activePaidMembers: number;
      freeLeads: number;
      cancelledMembers: number;
      totalProfiles: number;
      adminRevenueCents: number;
      pendingPayoutsCents: number;
      recentActivity: { kind: 'payment' | 'signup'; email: string | null; detail: string; at: string }[];
    }>('/admin/overview'),
  adminUsers: (filter = 'all', page = 1, q = '') =>
    req<{ rows: AdminUserRow[]; total: number; page: number; pageSize: number }>(
      `/admin/users?filter=${filter}&page=${page}&q=${encodeURIComponent(q)}`,
    ),
  adminSetStatus: (id: string, accountType: 'free' | 'paid') =>
    req<{ user: unknown }>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ accountType }) }),
  adminReassign: (id: string, affiliateCode: string) =>
    req<{ reassigned: boolean; affiliateEmail: string }>(`/admin/users/${id}/referrer`, {
      method: 'POST',
      body: JSON.stringify({ affiliateCode }),
    }),
  adminFraud: (resolved = false) => req<{ rows: AdminFraudRow[] }>(`/admin/fraud?resolved=${resolved ? 1 : 0}`),
  adminResolveFraud: (id: string) => req<{ resolved: boolean }>(`/admin/fraud/${id}`, { method: 'POST' }),
  adminSupportTickets: (page = 1) =>
    req<{ rows: AdminSupportTicketRow[]; total: number; page: number; pageSize: number }>(
      `/admin/support?page=${page}`,
    ),

  // --- M2: payments / affiliate ---
  dashboard: () =>
    req<{
      stats: AffiliateStats;
      recentReferrals: { id: string; email: string; status: string; date: string; source: string | null }[];
      commissionHistory: {
        id: string;
        amountCents: number;
        kind: string;
        status: string;
        date: string;
        availableAt: string | null;
      }[];
    }>('/me/dashboard'),
  commissions: () =>
    req<{
      walletCents: number;
      pendingCents: number;
      thisMonthCents: number;
      lifetimeCents: number;
      cashouts: unknown[];
      transactions: { id: string; type: string; amountCents: number; date: string }[];
    }>('/me/commissions'),

  // --- M3: payouts ---
  myPayouts: () =>
    req<{ payouts: PayoutRow[] }>('/me/payouts'),
  requestPayout: (method: PayoutMethod, methodDetails: string) =>
    req<{ payout: PayoutRow }>('/me/payouts', {
      method: 'POST',
      body: JSON.stringify({ method, methodDetails }),
    }),
  adminPayouts: (status: PayoutStatus | 'all' = 'requested', page = 1) =>
    req<{ rows: AdminPayoutRow[]; total: number; page: number; pageSize: number }>(
      `/admin/payouts?status=${status}&page=${page}`,
    ),
  approvePayout: (id: string) =>
    req<{ payout: PayoutRow }>(`/admin/payouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'approve' }),
    }),
  rejectPayout: (id: string, reason: string) =>
    req<{ payout: PayoutRow }>(`/admin/payouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'reject', reason }),
    }),
  subscription: () =>
    req<{ subscription: SubscriptionSummary | null }>('/me/subscription'),
  cancelSubscription: () =>
    req<{ subscription: SubscriptionSummary }>('/me/subscription', {
      method: 'POST',
      body: JSON.stringify({ action: 'cancel' }),
    }),
  resumeSubscription: () =>
    req<{ subscription: SubscriptionSummary }>('/me/subscription', {
      method: 'POST',
      body: JSON.stringify({ action: 'resume' }),
    }),
};

export interface AffiliateStats {
  totalClicks: number;
  totalReferrals: number;
  totalCommissionsCents: number;
  pendingCents: number;
  availableCents: number;
  thisMonthCents: number;
}

export interface SubscriptionSummary {
  state: string;
  priceCents: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface AdminFraudRow {
  id: string;
  profile_email: string | null;
  type: string;
  severity: string;
  details: unknown;
  auto_action: string | null;
  resolved: boolean;
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  account_type: 'free' | 'paid';
  free_variant: 'lead' | 'downgraded';
  role: 'user' | 'admin';
  is_affiliate: boolean;
  affiliate_code: string | null;
  created_at: string;
  referral_count: number;
  total_earned_cents: number;
}

export interface AdminSupportTicketRow {
  id: string;
  profile_id: string | null;
  from_email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export type PayoutMethod = 'paypal' | 'cashapp' | 'bank' | 'other';
export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

export interface PayoutRow {
  id: string;
  amountCents: number;
  status: PayoutStatus;
  method: PayoutMethod | null;
  requestedAt: string;
  paidAt: string | null;
  rejectedReason: string | null;
}

export interface AdminPayoutRow extends PayoutRow {
  affiliateEmail: string;
  affiliateName: string | null;
  methodDetails: unknown;
}
