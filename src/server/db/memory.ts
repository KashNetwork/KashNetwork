import { randomUUID } from 'node:crypto';
import type { ClickLinkKind, CommissionKind } from '@/shared';
import type { Repo } from './repo';
import type {
  AdminUserListParams,
  AdminUserListRow,
  AffiliateStats,
  ClickRow,
  CommissionRow,
  EmailChangeRow,
  FraudFlagInput,
  NewProfile,
  NotificationRow,
  PaymentEventRow,
  ProfileRow,
  ReferralRow,
  SessionRow,
  SubscriptionRow,
  SupportTicketRow,
} from './types';

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
  // M2
  paymentEvents: PaymentEventRow[] = [];
  subscriptions = new Map<string, SubscriptionRow>();
  referrals = new Map<string, ReferralRow>();
  commissions = new Map<string, CommissionRow>();
  referralLinks: Array<{ affiliate_id: string; kind: ClickLinkKind; active: boolean }> = [];
  fraudFlags: Array<Record<string, unknown>> = [];

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

  async listSupportTickets(params: { page: number; pageSize: number }) {
    const sorted = [...this.tickets].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const start = (params.page - 1) * params.pageSize;
    return { rows: sorted.slice(start, start + params.pageSize), total: sorted.length };
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
    const { MONEY } = await import('@/shared');
    let adminRevenueCents = 0;
    for (const e of this.paymentEvents) {
      if (e.event_type === 'trial_started') adminRevenueCents += MONEY.adminTrialCents;
      else if (e.event_type === 'subscription_activated' || e.event_type === 'rebill_succeeded')
        adminRevenueCents += MONEY.adminRecurringCents;
    }
    const payableCents = [...this.commissions.values()]
      .filter((c) => c.status === 'available' || c.status === 'requested')
      .reduce((s, c) => s + c.amount_cents, 0);
    return {
      activePaid: all.filter((p) => p.account_type === 'paid').length,
      freeLeads: all.filter((p) => p.account_type === 'free' && p.free_variant === 'lead').length,
      cancelled: all.filter((p) => p.free_variant === 'downgraded').length,
      totalProfiles: all.length,
      adminRevenueCents,
      payableCents,
    };
  }

  private referralCountFor(affiliateId: string) {
    return [...this.referrals.values()].filter((r) => r.affiliate_id === affiliateId).length;
  }
  private earnedCentsFor(affiliateId: string) {
    return [...this.commissions.values()]
      .filter((c) => c.affiliate_id === affiliateId && c.status === 'paid')
      .reduce((s, c) => s + c.amount_cents, 0);
  }

  /* -------------------------------------------------------- M2: payments */

  async getPaymentEventByDedupeKey(key: string) {
    return this.paymentEvents.find((e) => e.dedupe_key === key) ?? null;
  }
  async getPaymentEventsByTxn(externalTxnId: string) {
    return this.paymentEvents.filter((e) => e.external_txn_id === externalTxnId);
  }
  async recordPaymentEvent(input: Parameters<Repo['recordPaymentEvent']>[0]): Promise<PaymentEventRow> {
    const row: PaymentEventRow = {
      id: randomUUID(),
      provider: input.provider,
      event_type: input.eventType,
      external_txn_id: input.externalTxnId,
      external_sub_id: input.externalSubId,
      customer_email: input.customerEmail ? this.norm(input.customerEmail) : null,
      amount_cents: input.amountCents,
      currency: input.currency,
      affiliate_ref: input.affiliateRef,
      occurred_at: input.occurredAt,
      raw: input.raw,
      signature_valid: input.signatureValid,
      dedupe_key: input.dedupeKey,
      processed_at: null,
      processing_error: null,
      created_at: now(),
    };
    this.paymentEvents.push(row);
    return row;
  }
  async markPaymentEventProcessed(id: string, error?: string | null) {
    const e = this.paymentEvents.find((x) => x.id === id);
    if (e) {
      e.processed_at = now();
      e.processing_error = error ?? null;
    }
  }
  async listUnprocessedPaymentEvents(limit: number) {
    return this.paymentEvents.filter((e) => !e.processed_at).slice(0, limit);
  }

  async getSubscriptionByExternalId(externalSubId: string) {
    return [...this.subscriptions.values()].find((s) => s.external_sub_id === externalSubId) ?? null;
  }
  async getSubscriptionByProfile(profileId: string) {
    return (
      [...this.subscriptions.values()]
        .filter((s) => s.profile_id === profileId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
    );
  }
  async createSubscription(input: Partial<SubscriptionRow> & { profile_id: string }) {
    const ts = now();
    const row: SubscriptionRow = {
      id: randomUUID(),
      profile_id: input.profile_id,
      external_sub_id: input.external_sub_id ?? null,
      external_product_id: input.external_product_id ?? null,
      state: input.state ?? 'trialing',
      price_cents: input.price_cents ?? 100,
      trial_started_at: input.trial_started_at ?? null,
      trial_ends_at: input.trial_ends_at ?? null,
      current_period_end: input.current_period_end ?? null,
      cancel_at_period_end: input.cancel_at_period_end ?? false,
      cancelled_at: input.cancelled_at ?? null,
      reactivated_at: input.reactivated_at ?? null,
      created_at: ts,
      updated_at: ts,
    };
    this.subscriptions.set(row.id, row);
    return row;
  }
  async updateSubscription(id: string, patch: Partial<SubscriptionRow>) {
    const cur = this.subscriptions.get(id);
    if (!cur) throw new Error('subscription_not_found');
    const next = { ...cur, ...patch, id: cur.id, updated_at: now() };
    this.subscriptions.set(id, next);
    return next;
  }
  async listSubscriptionsDueToExpire(nowIso: string) {
    return [...this.subscriptions.values()].filter(
      (s) =>
        s.cancel_at_period_end &&
        s.state !== 'cancelled' &&
        s.current_period_end != null &&
        s.current_period_end <= nowIso,
    );
  }

  async getReferralByReferredProfile(referredProfileId: string) {
    return (
      [...this.referrals.values()].find((r) => r.referred_profile_id === referredProfileId) ?? null
    );
  }
  async createReferral(input: Parameters<Repo['createReferral']>[0]) {
    const ts = now();
    const row: ReferralRow = {
      id: randomUUID(),
      affiliate_id: input.affiliateId,
      referred_profile_id: input.referredProfileId,
      status: input.status ?? 'trial',
      first_click_at: input.firstClickAt ?? null,
      last_click_at: input.lastClickAt ?? null,
      attributed_at: ts,
      attribution_locked: input.attributionLocked ?? true,
      attribution_source: input.attributionSource,
      created_at: ts,
    };
    this.referrals.set(row.id, row);
    return row;
  }
  async updateReferral(id: string, patch: Partial<ReferralRow>) {
    const cur = this.referrals.get(id);
    if (!cur) throw new Error('referral_not_found');
    const next = { ...cur, ...patch, id: cur.id };
    this.referrals.set(id, next);
    return next;
  }
  async listReferralsByAffiliate(affiliateId: string, limit = 50) {
    return [...this.referrals.values()]
      .filter((r) => r.affiliate_id === affiliateId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
  async reassignReferralsToAdmin(fromAffiliateId: string, adminId: string) {
    let n = 0;
    for (const r of this.referrals.values()) {
      if (r.affiliate_id === fromAffiliateId) {
        r.affiliate_id = adminId;
        n++;
      }
    }
    return n;
  }
  async ensureReferralLinks(affiliateId: string, kinds: ClickLinkKind[]) {
    for (const kind of kinds) {
      if (!this.referralLinks.some((l) => l.affiliate_id === affiliateId && l.kind === kind))
        this.referralLinks.push({ affiliate_id: affiliateId, kind, active: true });
    }
  }
  async setReferralLinksActive(affiliateId: string, active: boolean) {
    for (const l of this.referralLinks) if (l.affiliate_id === affiliateId) l.active = active;
  }

  async getCommissionForReferralEvent(referralId: string, paymentEventId: string) {
    return (
      [...this.commissions.values()].find(
        (c) => c.referral_id === referralId && c.payment_event_id === paymentEventId,
      ) ?? null
    );
  }
  async createCommission(input: {
    affiliateId: string;
    referralId: string;
    subscriptionId: string | null;
    paymentEventId: string | null;
    amountCents: number;
    kind: CommissionKind;
    holdUntil: string;
  }) {
    const row: CommissionRow = {
      id: randomUUID(),
      affiliate_id: input.affiliateId,
      referral_id: input.referralId,
      subscription_id: input.subscriptionId,
      payment_event_id: input.paymentEventId,
      amount_cents: input.amountCents,
      kind: input.kind,
      status: 'pending',
      hold_until: input.holdUntil,
      available_at: null,
      reversed_at: null,
      reversal_reason: null,
      payout_id: null,
      created_at: now(),
    };
    this.commissions.set(row.id, row);
    return row;
  }
  async updateCommission(id: string, patch: Partial<CommissionRow>) {
    const cur = this.commissions.get(id);
    if (!cur) throw new Error('commission_not_found');
    const next = { ...cur, ...patch, id: cur.id };
    this.commissions.set(id, next);
    return next;
  }
  async reverseCommissionsForPaymentEvent(paymentEventId: string, reason: string) {
    let n = 0;
    for (const c of this.commissions.values()) {
      if (c.payment_event_id === paymentEventId && c.status !== 'paid' && c.status !== 'reversed') {
        c.status = 'reversed';
        c.reversed_at = now();
        c.reversal_reason = reason;
        n++;
      }
    }
    return n;
  }
  async forfeitUnpaidCommissions(affiliateId: string, reason: string) {
    let n = 0;
    for (const c of this.commissions.values()) {
      if (c.affiliate_id === affiliateId && c.status !== 'paid' && c.status !== 'reversed') {
        c.status = 'reversed';
        c.reversed_at = now();
        c.reversal_reason = reason;
        n++;
      }
    }
    return n;
  }
  async promoteEligibleCommissions(nowIso: string) {
    let n = 0;
    for (const c of this.commissions.values()) {
      if (c.status === 'pending' && c.hold_until <= nowIso) {
        c.status = 'available';
        c.available_at = now();
        n++;
      }
    }
    return n;
  }
  async listCommissionsByAffiliate(affiliateId: string, limit = 50) {
    return [...this.commissions.values()]
      .filter((c) => c.affiliate_id === affiliateId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  async createFraudFlag(input: FraudFlagInput) {
    this.fraudFlags.push({ ...input, id: randomUUID(), created_at: now(), resolved: false });
  }

  async lastAttributableClick(input: {
    visitorId?: string | null;
    email?: string | null;
    windowDays: number;
  }) {
    const cutoff = new Date(Date.now() - input.windowDays * 86400_000).toISOString();
    const candidates = this.clicks
      .filter((c) => c.created_at >= cutoff)
      .filter((c) => (input.visitorId ? c.visitor_id === input.visitorId : true))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return candidates[0] ?? null;
  }

  async affiliateStats(affiliateId: string): Promise<AffiliateStats> {
    const comms = [...this.commissions.values()].filter((c) => c.affiliate_id === affiliateId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const sum = (f: (c: CommissionRow) => boolean) =>
      comms.filter(f).reduce((s, c) => s + c.amount_cents, 0);
    return {
      totalClicks: this.clicks.filter((c) => c.affiliate_id === affiliateId).length,
      totalReferrals: this.referralCountFor(affiliateId),
      totalCommissionsCents: sum((c) => ['paid', 'available', 'requested'].includes(c.status)),
      pendingCents: sum((c) => c.status === 'pending'),
      availableCents: sum((c) => c.status === 'available'),
      thisMonthCents: sum((c) => new Date(c.created_at) >= monthStart && c.status !== 'reversed'),
    };
  }

  async paymentsForEmail(email: string) {
    const e = this.norm(email);
    return this.paymentEvents
      .filter((p) => p.customer_email === e)
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
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
      referral_count: this.referralCountFor(p.id),
      total_earned_cents: this.earnedCentsFor(p.id),
    }));
    return { rows: page, total };
  }
}
