import { normalizeEmail } from '../services/fraud';
import { randomUUID } from 'node:crypto';
import type { ClickLinkKind, CommissionKind, EmailDirection, PayoutMethod, PayoutStatus } from '@/shared';
import type { Repo } from './repo';
import type {
  AdminPayoutListRow,
  AdminUserListParams,
  AdminUserListRow,
  AffiliateStats,
  ClickRow,
  CommissionRow,
  DueLeadRow,
  EmailChangeRow,
  AiThreadRow,
  EmailMessageRow,
  FraudFlagInput,
  LeadStateRow,
  NewProfile,
  NotificationRow,
  LiveEventRow,
  FraudFlagRow,
  PaymentEventRow,
  PayoutRow,
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
  // M3
  payouts = new Map<string, PayoutRow>();
  payoutItems: Array<{ payout_id: string; commission_id: string }> = [];
  leadStates = new Map<string, LeadStateRow>();
  emailMessages: EmailMessageRow[] = [];
  settings = new Map<string, unknown>();
  aiThreads = new Map<string, AiThreadRow>();
  aiReplyLog: string[] = [];

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

  async listLiveEvents(limit: number) {
    const out: LiveEventRow[] = [];
    for (const p of this.profiles.values()) {
      if (p.role === 'admin') continue;
      const sub = [...this.subscriptions.values()]
        .filter((s) => s.profile_id === p.id)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      if (p.account_type === 'paid' && sub)
        out.push({ id: 'j-' + p.id, kind: 'joined', full_name: p.full_name, email: p.email, amount_cents: 0, at: sub.created_at });
    }
    for (const c of this.commissions.values()) {
      const p = this.profiles.get(c.affiliate_id);
      if (!p || p.role === 'admin' || c.reversed_at) continue;
      out.push({ id: 'c-' + c.id, kind: 'earned', full_name: p.full_name, email: p.email, amount_cents: c.amount_cents, at: c.created_at });
    }
    return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
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
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const reversed = new Set(
      this.paymentEvents
        .filter((e) => e.event_type === 'refunded' || e.event_type === 'chargeback')
        .map((e) => e.external_txn_id),
    );
    for (const e of this.paymentEvents) {
      if (new Date(e.occurred_at) < monthStart) continue;
      if (e.external_txn_id && reversed.has(e.external_txn_id)) continue;
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
      recentActivity: [
        ...this.paymentEvents.map((e) => ({
          kind: 'payment' as const,
          email: e.customer_email ?? null,
          detail: e.event_type as string,
          at: new Date(e.occurred_at).toISOString(),
        })),
        ...all.map((p) => ({
          kind: 'signup' as const,
          email: p.email as string | null,
          detail: p.account_type as string,
          at: new Date(p.created_at).toISOString(),
        })),
      ]
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, 15),
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

  async findDuplicateProfile(normalizedEmail: string, excludeId: string) {
    const hit = [...this.profiles.values()].find(
      (p) => p.id !== excludeId && normalizeEmail(p.email) === normalizedEmail,
    );
    return hit ? { id: hit.id } : null;
  }

  async listFraudFlags(resolved: boolean, limit: number) {
    return this.fraudFlags
      .filter((f) => Boolean(f.resolved) === resolved)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, limit)
      .map((f) => ({
        id: String(f.id),
        profile_email: this.profiles.get(String(f.profileId))?.email ?? null,
        type: f.type as FraudFlagRow['type'],
        severity: String(f.severity ?? 'medium'),
        details: f.details ?? null,
        auto_action: (f.autoAction as string | null) ?? null,
        resolved: Boolean(f.resolved),
        created_at: String(f.created_at),
      }));
  }

  async resolveFraudFlag(id: string, _adminId: string) {
    const f = this.fraudFlags.find((x) => x.id === id);
    if (f) f.resolved = true;
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

  /* ------------------------------------------------------------ M3: payouts */

  async createPayoutRequest(input: {
    affiliateId: string;
    method: PayoutMethod;
    methodDetails: unknown;
  }): Promise<PayoutRow | null> {
    const claimable = [...this.commissions.values()].filter(
      (c) => c.affiliate_id === input.affiliateId && c.status === 'available',
    );
    if (claimable.length === 0) return null;

    const amountCents = claimable.reduce((s, c) => s + c.amount_cents, 0);
    const row: PayoutRow = {
      id: randomUUID(),
      affiliate_id: input.affiliateId,
      amount_cents: amountCents,
      status: 'requested',
      method: input.method,
      method_details: input.methodDetails,
      requested_at: now(),
      approved_at: null,
      paid_at: null,
      rejected_reason: null,
      acted_by: null,
      created_at: now(),
    };
    this.payouts.set(row.id, row);
    for (const c of claimable) {
      this.payoutItems.push({ payout_id: row.id, commission_id: c.id });
      this.commissions.set(c.id, { ...c, status: 'requested', payout_id: row.id });
    }
    return row;
  }

  async getPayoutById(id: string) {
    return this.payouts.get(id) ?? null;
  }

  async listPayoutsByAffiliate(affiliateId: string, limit = 50) {
    return [...this.payouts.values()]
      .filter((p) => p.affiliate_id === affiliateId)
      .sort((a, b) => b.requested_at.localeCompare(a.requested_at))
      .slice(0, limit);
  }

  async listPayoutsByStatus(
    status: PayoutStatus | 'all',
    params: { page: number; pageSize: number },
  ): Promise<{ rows: AdminPayoutListRow[]; total: number }> {
    let rows = [...this.payouts.values()];
    if (status !== 'all') rows = rows.filter((p) => p.status === status);
    rows.sort((a, b) => b.requested_at.localeCompare(a.requested_at));
    const total = rows.length;
    const start = (params.page - 1) * params.pageSize;
    const page = rows.slice(start, start + params.pageSize).map((p) => {
      const affiliate = this.profiles.get(p.affiliate_id);
      return {
        ...p,
        affiliate_email: affiliate?.email ?? 'unknown',
        affiliate_full_name: affiliate?.full_name ?? null,
      };
    });
    return { rows: page, total };
  }

  async approveAndPayPayout(id: string, actedBy: string): Promise<PayoutRow> {
    const payout = this.payouts.get(id);
    if (!payout) throw new Error('payout not found');
    if (payout.status !== 'requested') throw new Error(`payout is ${payout.status}, not requested`);
    const paidAt = now();
    const updated: PayoutRow = { ...payout, status: 'paid', approved_at: paidAt, paid_at: paidAt, acted_by: actedBy };
    this.payouts.set(id, updated);
    for (const item of this.payoutItems.filter((i) => i.payout_id === id)) {
      const c = this.commissions.get(item.commission_id);
      if (c) this.commissions.set(c.id, { ...c, status: 'paid' });
    }
    return updated;
  }

  async rejectPayout(id: string, actedBy: string, reason: string): Promise<PayoutRow> {
    const payout = this.payouts.get(id);
    if (!payout) throw new Error('payout not found');
    if (payout.status !== 'requested') throw new Error(`payout is ${payout.status}, not requested`);
    const updated: PayoutRow = { ...payout, status: 'rejected', rejected_reason: reason, acted_by: actedBy };
    this.payouts.set(id, updated);
    for (const item of this.payoutItems.filter((i) => i.payout_id === id)) {
      const c = this.commissions.get(item.commission_id);
      if (c) this.commissions.set(c.id, { ...c, status: 'available', payout_id: null });
    }
    return updated;
  }

  /* -------------------------------------------------------- M3: email nurture */

  async createLeadState(input: {
    profileId: string;
    sequence: string;
    emailAffiliateId: string | null;
    nextSendAt: string;
  }): Promise<LeadStateRow> {
    const row: LeadStateRow = {
      profile_id: input.profileId,
      sequence: input.sequence,
      sequence_step: 0,
      next_send_at: input.nextSendAt,
      sequence_status: 'active',
      email_affiliate_id: input.emailAffiliateId,
      entered_at: now(),
      converted_at: null,
      updated_at: now(),
    };
    this.leadStates.set(input.profileId, row);
    return row;
  }

  async getLeadStateByProfile(profileId: string) {
    return this.leadStates.get(profileId) ?? null;
  }

  async updateLeadState(profileId: string, patch: Partial<LeadStateRow>) {
    const existing = this.leadStates.get(profileId);
    if (!existing) throw new Error('lead_state not found');
    const updated = { ...existing, ...patch, updated_at: now() };
    this.leadStates.set(profileId, updated);
    return updated;
  }

  async listLeadsDueForSend(nowIso: string, limit: number): Promise<DueLeadRow[]> {
    return [...this.leadStates.values()]
      .filter((l) => l.sequence_status === 'active' && l.next_send_at !== null && l.next_send_at <= nowIso)
      .sort((a, b) => (a.next_send_at ?? '').localeCompare(b.next_send_at ?? ''))
      .slice(0, limit)
      .map((l) => {
        const p = this.profiles.get(l.profile_id);
        return { ...l, email: p?.email ?? '', full_name: p?.full_name ?? null };
      });
  }

  async createEmailMessage(input: {
    profileId: string | null;
    direction: EmailDirection;
    fromAddr: string;
    toAddr: string;
    subject: string | null;
    bodyText: string | null;
    bodyHtml: string | null;
    sequenceStep?: number | null;
    providerMessageId?: string | null;
    inReplyTo?: string | null;
    aiGenerated?: boolean;
  }): Promise<EmailMessageRow> {
    const row: EmailMessageRow = {
      id: randomUUID(),
      profile_id: input.profileId,
      direction: input.direction,
      from_addr: input.fromAddr,
      to_addr: input.toAddr,
      subject: input.subject,
      body_text: input.bodyText,
      body_html: input.bodyHtml,
      sequence_step: input.sequenceStep ?? null,
      provider_message_id: input.providerMessageId ?? null,
      in_reply_to: input.inReplyTo ?? null,
      ai_generated: input.aiGenerated ?? false,
      created_at: now(),
    };
    this.emailMessages.push(row);
    return row;
  }

  async getSetting<T = unknown>(key: string) {
    return (this.settings.has(key) ? (this.settings.get(key) as T) : null) as T | null;
  }

  async setSetting(key: string, value: unknown) {
    this.settings.set(key, value);
  }

  async getAiThread(profileId: string) {
    return this.aiThreads.get(profileId) ?? null;
  }

  async recordAiReply(profileId: string) {
    const nowIso = now();
    const t = this.aiThreads.get(profileId);
    const row: AiThreadRow = t
      ? { ...t, message_count: t.message_count + 1, last_message_at: nowIso, first_reply_at: t.first_reply_at ?? nowIso }
      : {
          id: randomUUID(),
          profile_id: profileId,
          active: true,
          first_reply_at: nowIso,
          message_count: 1,
          last_message_at: nowIso,
          created_at: nowIso,
        };
    this.aiThreads.set(profileId, row);
    this.aiReplyLog.push(nowIso);
    return row;
  }

  async setAiThreadActive(profileId: string, active: boolean) {
    const t = this.aiThreads.get(profileId);
    if (t) this.aiThreads.set(profileId, { ...t, active });
  }

  async countAiRepliesSince(sinceIso: string) {
    return this.aiReplyLog.filter((t) => t >= sinceIso).length;
  }

  async listEmailMessagesByProfile(profileId: string, limit = 50) {
    return this.emailMessages
      .filter((m) => m.profile_id === profileId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
}
