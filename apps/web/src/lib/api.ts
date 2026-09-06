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
  me: () => req<{ me: Me }>('/me'),
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
  adminOverview: () =>
    req<{
      activePaidMembers: number;
      freeLeads: number;
      cancelledMembers: number;
      totalProfiles: number;
      adminRevenueCents: number;
      pendingPayoutsCents: number;
    }>('/admin/overview'),
  adminUsers: (filter = 'all', page = 1, q = '') =>
    req<{ rows: AdminUserRow[]; total: number; page: number; pageSize: number }>(
      `/admin/users?filter=${filter}&page=${page}&q=${encodeURIComponent(q)}`,
    ),
};

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
