import { randomUUID } from 'node:crypto';
import type { Repo } from './repo.js';
import type {
  AdminUserListParams,
  AdminUserListRow,
  ClickRow,
  EmailChangeRow,
  NewProfile,
  NotificationRow,
  ProfileRow,
  SessionRow,
  SupportTicketRow,
} from './types.js';

const now = () => new Date().toISOString();

/**
 * In-memory Repo for local dev (no Supabase creds) and unit tests.
 * Not persistent — resets on restart. Seeded with placeholder notifications.
 */
export class InMemoryRepo implements Repo {
  profiles = new Map<string, ProfileRow>();
  sessions = new Map<string, SessionRow>();
  emailChanges = new Map<string, EmailChangeRow>();
  clicks: ClickRow[] = [];
  tickets: SupportTicketRow[] = [];
  notifications: NotificationRow[] = [];

  constructor(seed = true) {
    if (seed) this.seedNotifications();
  }

  private seedNotifications() {
    const lines: Array<[NotificationRow['location'], string, string, string]> = [
      ['both', 'Verified Member from New York', 'Just earned 3 commissions today!', '4 minutes ago'],
      ['both', 'New Member from Georgia', 'Just joined Kash Network!', '1 minute ago'],
      ['both', 'Verified Member from California', 'Just earned 5 commissions today!', '10 minutes ago'],
      ['both', 'Verified Member from Arizona', 'Just earned a residual commission!', '5 minutes ago'],
      ['both', 'Verified Member from Texas', 'Just earned their first commission!', '3 hrs ago'],
    ];
    for (const [location, member_label, message, relative_time_text] of lines) {
      this.notifications.push({
        id: randomUUID(),
        location,
        member_label,
        message,
        relative_time_text,
        weight: 1,
        active: true,
        created_at: now(),
      });
    }
  }

  private norm(email: string) {
    return email.trim().toLowerCase();
  }

  async getProfileById(id: string) {
    return this.profiles.get(id) ?? null;
  }
  async getProfileByEmail(email: string) {
    const e = this.norm(email);
    return [...this.profiles.values()].find((p) => p.email === e) ?? null;
  }
  async getProfileByAffiliateCode(code: string) {
    return [...this.profiles.values()].find((p) => p.affiliate_code === code) ?? null;
  }
  async createProfile(input: NewProfile): Promise<ProfileRow> {
    const email = this.norm(input.email);
    if (await this.getProfileByEmail(email)) throw new Error('email_exists');
    const ts = now();
    const row: ProfileRow = {
      id: randomUUID(),
      email,
      full_name: input.full_name ?? null,
      password_hash: input.password_hash ?? null,
      role: input.role ?? 'user',
      account_type: input.account_type ?? 'free',
      free_variant: input.free_variant ?? 'lead',
      is_affiliate: false,
      affiliate_code: null,
      referred_by_affiliate_id: input.referred_by_affiliate_id ?? null,
      admin_reassigned: false,
      signup_ip: input.signup_ip ?? null,
      signup_user_agent: input.signup_user_agent ?? null,
      signup_fingerprint: input.signup_fingerprint ?? null,
      email_verified_at: input.email_verified_at ?? null,
      payout_method: null,
      payout_details: null,
      created_at: ts,
      updated_at: ts,
    };
    this.profiles.set(row.id, row);
    return row;
  }
  async updateProfile(id: string, patch: Partial<ProfileRow>): Promise<ProfileRow> {
    const cur = this.profiles.get(id);
    if (!cur) throw new Error('profile_not_found');
    const next = { ...cur, ...patch, id: cur.id, updated_at: now() };
    if (patch.email) next.email = this.norm(patch.email);
    this.profiles.set(id, next);
    return next;
  }

  async createSession(input: {
    profileId: string;
    tokenHash: string;
    kind: SessionRow['kind'];
    ip?: string | null;
    userAgent?: string | null;
    expiresAt: string;
  }): Promise<SessionRow> {
    const ts = now();
    const row: SessionRow = {
      id: randomUUID(),
      profile_id: input.profileId,
      token_hash: input.tokenHash,
      kind: input.kind,
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      created_at: ts,
      last_seen_at: ts,
      expires_at: input.expiresAt,
      revoked_at: null,
    };
    this.sessions.set(row.id, row);
    return row;
  }
  async getSessionByTokenHash(tokenHash: string) {
    return [...this.sessions.values()].find((s) => s.token_hash === tokenHash) ?? null;
  }
  async touchSession(id: string, lastSeenAt: string) {
    const s = this.sessions.get(id);
    if (s) s.last_seen_at = lastSeenAt;
  }
  async revokeSession(id: string) {
    const s = this.sessions.get(id);
    if (s) s.revoked_at = now();
  }
  async revokeAllSessionsForProfile(profileId: string) {
    for (const s of this.sessions.values())
      if (s.profile_id === profileId && !s.revoked_at) s.revoked_at = now();
  }

  async createEmailChange(input: {
    profileId: string;
    newEmail: string;
    tokenHash: string;
    expiresAt: string;
  }): Promise<EmailChangeRow> {
    const row: EmailChangeRow = {
      id: randomUUID(),
      profile_id: input.profileId,
      new_email: this.norm(input.newEmail),
      token_hash: input.tokenHash,
      created_at: now(),
      expires_at: input.expiresAt,
      confirmed_at: null,
    };
    this.emailChanges.set(row.id, row);
    return row;
  }
  async getEmailChangeByTokenHash(tokenHash: string) {
    return [...this.emailChanges.values()].find((r) => r.token_hash === tokenHash) ?? null;
  }
  async markEmailChangeConfirmed(id: string) {
    const r = this.emailChanges.get(id);
    if (r) r.confirmed_at = now();
  }

  async createClick(input: Omit<ClickRow, 'id' | 'created_at'>): Promise<ClickRow> {
    const row: ClickRow = { ...input, id: randomUUID(), created_at: now() };
    this.clicks.push(row);
    return row;
  }

  async createSupportTicket(input: {
    profileId: string | null;
    fromEmail: string;
    subject: string | null;
    message: string;
  }): Promise<SupportTicketRow> {
    const row: SupportTicketRow = {
      id: randomUUID(),
      profile_id: input.profileId,
      from_email: input.fromEmail,
      subject: input.subject,
      message: input.message,
      status: 'open',
      created_at: now(),
    };
    this.tickets.push(row);
    return row;
  }

  async listNotifications(location: 'landing' | 'sales') {
    return this.notifications.filter(
      (n) => n.active && (n.location === 'both' || n.location === location),
    );
  }

  audits: Array<Record<string, unknown>> = [];
  async createAudit(input: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    before?: unknown;
    after?: unknown;
  }) {
    this.audits.push({ ...input, id: randomUUID(), created_at: now() });
  }

  async adminOverview() {
    const all = [...this.profiles.values()].filter((p) => p.role !== 'admin');
    return {
      activePaid: all.filter((p) => p.account_type === 'paid').length,
      freeLeads: all.filter((p) => p.account_type === 'free' && p.free_variant === 'lead').length,
      cancelled: all.filter((p) => p.free_variant === 'downgraded').length,
      totalProfiles: all.length,
    };
  }

  async adminListUsers(params: AdminUserListParams) {
    let rows = [...this.profiles.values()].filter((p) => p.role !== 'admin');
    if (params.filter === 'free_leads')
      rows = rows.filter((p) => p.account_type === 'free' && p.free_variant === 'lead');
    else if (params.filter === 'active_paid')
      rows = rows.filter((p) => p.account_type === 'paid');
    else if (params.filter === 'cancelled')
      rows = rows.filter((p) => p.free_variant === 'downgraded');
    if (params.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (p) => p.email.includes(q) || (p.full_name ?? '').toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const total = rows.length;
    const start = (params.page - 1) * params.pageSize;
    const page = rows.slice(start, start + params.pageSize).map<AdminUserListRow>((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      account_type: p.account_type,
      free_variant: p.free_variant,
      role: p.role,
      is_affiliate: p.is_affiliate,
      affiliate_code: p.affiliate_code,
      created_at: p.created_at,
      referral_count: 0,
      total_earned_cents: 0,
    }));
    return { rows: page, total };
  }
}
