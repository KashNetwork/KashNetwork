import type { ClickLinkKind, CommissionKind, PayoutMethod, PayoutStatus } from '@/shared';
import { MONEY } from '@/shared';
import type { Repo } from './repo';
import type { SqlClient } from './sql';
import type {
  AdminPayoutListRow,
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
  PayoutRow,
  ProfileRow,
  ReferralRow,
  SessionRow,
  SubscriptionRow,
  SupportTicketRow,
} from './types';

const PROFILE_COLS = `id, email, full_name, password_hash, role, account_type, free_variant,
  is_affiliate, affiliate_code, referred_by_affiliate_id, admin_reassigned,
  signup_ip, signup_user_agent, signup_fingerprint, email_verified_at,
  payout_method, payout_details, created_at, updated_at`;

// updatable profile columns -> optional cast for the bound parameter
const PROFILE_UPDATABLE: Record<string, string> = {
  email: '::citext',
  full_name: '',
  password_hash: '',
  role: '::user_role',
  account_type: '::account_type',
  free_variant: '::free_variant',
  is_affiliate: '::boolean',
  affiliate_code: '',
  referred_by_affiliate_id: '::uuid',
  admin_reassigned: '::boolean',
  email_verified_at: '::timestamptz',
  payout_method: '::payout_method',
  payout_details: '::jsonb',
};

const norm = (e: string) => e.trim().toLowerCase();
const one = <T>(rows: T[]): T | null => rows[0] ?? null;

/** Repo backed by raw SQL — works against PGlite or real Postgres. */
export class SqlRepo implements Repo {
  constructor(private db: SqlClient) {}

  async getProfileById(id: string) {
    return one(
      await this.db.query<ProfileRow>(
        `select ${PROFILE_COLS} from profiles where id = $1`,
        [id],
      ),
    );
  }
  async getProfileByEmail(email: string) {
    return one(
      await this.db.query<ProfileRow>(
        `select ${PROFILE_COLS} from profiles where email = $1`,
        [norm(email)],
      ),
    );
  }
  async getProfileByAffiliateCode(code: string) {
    return one(
      await this.db.query<ProfileRow>(
        `select ${PROFILE_COLS} from profiles where affiliate_code = $1`,
        [code],
      ),
    );
  }
  async createProfile(input: NewProfile): Promise<ProfileRow> {
    return (
      await this.db.query<ProfileRow>(
        `insert into profiles
           (email, full_name, password_hash, role, account_type, free_variant,
            referred_by_affiliate_id, signup_ip, signup_user_agent,
            signup_fingerprint, email_verified_at)
         values ($1, $2, $3,
                 coalesce($4::text, 'user')::user_role,
                 coalesce($5::text, 'free')::account_type,
                 coalesce($6::text, 'lead')::free_variant,
                 $7::uuid, $8::inet, $9, $10, $11::timestamptz)
         returning ${PROFILE_COLS}`,
        [
          norm(input.email),
          input.full_name ?? null,
          input.password_hash ?? null,
          input.role ?? null,
          input.account_type ?? null,
          input.free_variant ?? null,
          input.referred_by_affiliate_id ?? null,
          input.signup_ip ?? null,
          input.signup_user_agent ?? null,
          input.signup_fingerprint ?? null,
          input.email_verified_at ?? null,
        ],
      )
    )[0]!;
  }
  async updateProfile(id: string, patch: Partial<ProfileRow>): Promise<ProfileRow> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(patch)) {
      const cast = PROFILE_UPDATABLE[k];
      if (cast === undefined) continue;
      let val: unknown = k === 'email' && typeof v === 'string' ? norm(v) : v;
      if (k === 'payout_details' && val != null) val = JSON.stringify(val);
      vals.push(val);
      sets.push(`${k} = $${vals.length}${cast}`);
    }
    if (sets.length === 0) {
      const cur = await this.getProfileById(id);
      if (!cur) throw new Error('profile_not_found');
      return cur;
    }
    vals.push(id);
    const rows = await this.db.query<ProfileRow>(
      `update profiles set ${sets.join(', ')}, updated_at = now()
       where id = $${vals.length} returning ${PROFILE_COLS}`,
      vals,
    );
    if (!rows[0]) throw new Error('profile_not_found');
    return rows[0];
  }

  async createSession(input: {
    profileId: string;
    tokenHash: string;
    kind: SessionRow['kind'];
    ip?: string | null;
    userAgent?: string | null;
    expiresAt: string;
  }): Promise<SessionRow> {
    return (
      await this.db.query<SessionRow>(
        `insert into sessions (profile_id, token_hash, kind, ip, user_agent, expires_at)
         values ($1::uuid, $2, $3::session_kind, $4::inet, $5, $6::timestamptz) returning *`,
        [
          input.profileId,
          input.tokenHash,
          input.kind,
          input.ip ?? null,
          input.userAgent ?? null,
          input.expiresAt,
        ],
      )
    )[0]!;
  }
  async getSessionByTokenHash(tokenHash: string) {
    return one(
      await this.db.query<SessionRow>('select * from sessions where token_hash = $1', [
        tokenHash,
      ]),
    );
  }
  async touchSession(id: string, lastSeenAt: string) {
    await this.db.query('update sessions set last_seen_at = $2 where id = $1', [id, lastSeenAt]);
  }
  async revokeSession(id: string) {
    await this.db.query('update sessions set revoked_at = now() where id = $1', [id]);
  }
  async revokeAllSessionsForProfile(profileId: string) {
    await this.db.query(
      'update sessions set revoked_at = now() where profile_id = $1 and revoked_at is null',
      [profileId],
    );
  }

  async createEmailChange(input: {
    profileId: string;
    newEmail: string;
    tokenHash: string;
    expiresAt: string;
  }): Promise<EmailChangeRow> {
    return (
      await this.db.query<EmailChangeRow>(
        `insert into email_change_requests (profile_id, new_email, token_hash, expires_at)
         values ($1::uuid, $2::citext, $3, $4::timestamptz) returning *`,
        [input.profileId, norm(input.newEmail), input.tokenHash, input.expiresAt],
      )
    )[0]!;
  }
  async getEmailChangeByTokenHash(tokenHash: string) {
    return one(
      await this.db.query<EmailChangeRow>(
        'select * from email_change_requests where token_hash = $1',
        [tokenHash],
      ),
    );
  }
  async markEmailChangeConfirmed(id: string) {
    await this.db.query(
      'update email_change_requests set confirmed_at = now() where id = $1',
      [id],
    );
  }

  async createClick(input: Omit<ClickRow, 'id' | 'created_at'>): Promise<ClickRow> {
    return (
      await this.db.query<ClickRow>(
        `insert into clicks (affiliate_id, link_kind, visitor_id, ip, user_agent, referer, landing_path)
         values ($1::uuid, $2::click_link_kind, $3::uuid, $4::inet, $5, $6, $7) returning *`,
        [
          input.affiliate_id,
          input.link_kind,
          input.visitor_id,
          input.ip,
          input.user_agent,
          input.referer,
          input.landing_path,
        ],
      )
    )[0]!;
  }

  async createSupportTicket(input: {
    profileId: string | null;
    fromEmail: string;
    subject: string | null;
    message: string;
  }): Promise<SupportTicketRow> {
    return (
      await this.db.query<SupportTicketRow>(
        `insert into support_tickets (profile_id, from_email, subject, message)
         values ($1,$2,$3,$4) returning *`,
        [input.profileId, input.fromEmail, input.subject, input.message],
      )
    )[0]!;
  }

  async listSupportTickets(params: { page: number; pageSize: number }) {
    const totalRows = await this.db.query<{ n: string }>(
      `select count(*) as n from support_tickets`,
      [],
    );
    const total = Number(totalRows[0]?.n ?? 0);
    const rows = await this.db.query<SupportTicketRow>(
      `select * from support_tickets order by created_at desc limit $1 offset $2`,
      [params.pageSize, (params.page - 1) * params.pageSize],
    );
    return { rows, total };
  }

  async listNotifications(location: 'landing' | 'sales') {
    return this.db.query<NotificationRow>(
      `select * from notifications where active = true and location in ('both', $1)`,
      [location],
    );
  }

  async createAudit(input: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    before?: unknown;
    after?: unknown;
  }) {
    await this.db.query(
      `insert into admin_audit (admin_id, action, target_type, target_id, before, after)
       values ($1::uuid, $2, $3, $4::uuid, $5::jsonb, $6::jsonb)`,
      [
        input.adminId,
        input.action,
        input.targetType,
        input.targetId,
        input.before ? JSON.stringify(input.before) : null,
        input.after ? JSON.stringify(input.after) : null,
      ],
    );
  }

  async adminOverview() {
    const rows = await this.db.query<{
      active_paid: string;
      free_leads: string;
      cancelled: string;
      total: string;
    }>(
      `select
         count(*) filter (where account_type = 'paid')                              as active_paid,
         count(*) filter (where account_type = 'free' and free_variant = 'lead')     as free_leads,
         count(*) filter (where free_variant = 'downgraded')                         as cancelled,
         count(*)                                                                    as total
       from profiles where role <> 'admin'`,
    );
    const r = rows[0]!;
    const fin = await this.db.query<{ rev: string; payable: string }>(
      `select
         coalesce((select
             count(*) filter (where event_type = 'trial_started') * $1
           + count(*) filter (where event_type in ('subscription_activated','rebill_succeeded')) * $2
           from payment_events), 0) as rev,
         coalesce((select sum(amount_cents) from commissions
                   where status in ('available','requested')), 0) as payable`,
      [MONEY.adminTrialCents, MONEY.adminRecurringCents],
    );
    return {
      activePaid: Number(r.active_paid),
      freeLeads: Number(r.free_leads),
      cancelled: Number(r.cancelled),
      totalProfiles: Number(r.total),
      adminRevenueCents: Number(fin[0]?.rev ?? 0),
      payableCents: Number(fin[0]?.payable ?? 0),
    };
  }

  async adminListUsers(params: AdminUserListParams) {
    const where: string[] = [`p.role <> 'admin'`];
    const vals: unknown[] = [];
    if (params.filter === 'free_leads')
      where.push(`p.account_type = 'free' and p.free_variant = 'lead'`);
    else if (params.filter === 'active_paid') where.push(`p.account_type = 'paid'`);
    else if (params.filter === 'cancelled') where.push(`p.free_variant = 'downgraded'`);
    if (params.q) {
      vals.push(`%${params.q.toLowerCase()}%`);
      where.push(`(lower(p.email) like $${vals.length} or lower(coalesce(p.full_name,'')) like $${vals.length})`);
    }
    const whereSql = where.join(' and ');

    const totalRows = await this.db.query<{ n: string }>(
      `select count(*) as n from profiles p where ${whereSql}`,
      vals,
    );
    const total = Number(totalRows[0]?.n ?? 0);

    vals.push(params.pageSize, (params.page - 1) * params.pageSize);
    const rows = await this.db.query<AdminUserListRow & { referral_count: string; total_earned_cents: string }>(
      `select p.id, p.email, p.full_name, p.account_type, p.free_variant, p.role,
              p.is_affiliate, p.affiliate_code, p.created_at,
              (select count(*) from referrals r where r.affiliate_id = p.id)                    as referral_count,
              coalesce((select sum(c.amount_cents) from commissions c
                        where c.affiliate_id = p.id and c.status = 'paid'), 0)                  as total_earned_cents
       from profiles p
       where ${whereSql}
       order by p.created_at desc
       limit $${vals.length - 1} offset $${vals.length}`,
      vals,
    );
    return {
      rows: rows.map((r) => ({
        ...r,
        referral_count: Number(r.referral_count),
        total_earned_cents: Number(r.total_earned_cents),
      })),
      total,
    };
  }

  /* -------------------------------------------------------- M2: payments */

  async getPaymentEventByDedupeKey(key: string) {
    return one(
      await this.db.query<PaymentEventRow>(
        'select * from payment_events where dedupe_key = $1',
        [key],
      ),
    );
  }
  async getPaymentEventsByTxn(externalTxnId: string) {
    return this.db.query<PaymentEventRow>(
      'select * from payment_events where external_txn_id = $1 order by occurred_at asc',
      [externalTxnId],
    );
  }
  async recordPaymentEvent(i: Parameters<Repo['recordPaymentEvent']>[0]): Promise<PaymentEventRow> {
    return (
      await this.db.query<PaymentEventRow>(
        `insert into payment_events
           (provider, event_type, external_txn_id, external_sub_id, customer_email,
            amount_cents, currency, affiliate_ref, occurred_at, raw, signature_valid, dedupe_key)
         values ($1,$2::payment_event_type,$3,$4,$5::citext,$6,$7,$8,$9::timestamptz,$10::jsonb,$11,$12)
         returning *`,
        [
          i.provider,
          i.eventType,
          i.externalTxnId,
          i.externalSubId,
          i.customerEmail,
          i.amountCents,
          i.currency,
          i.affiliateRef,
          i.occurredAt,
          JSON.stringify(i.raw ?? null),
          i.signatureValid,
          i.dedupeKey,
        ],
      )
    )[0]!;
  }
  async markPaymentEventProcessed(id: string, error?: string | null) {
    await this.db.query(
      'update payment_events set processed_at = now(), processing_error = $2 where id = $1',
      [id, error ?? null],
    );
  }
  async listUnprocessedPaymentEvents(limit: number) {
    return this.db.query<PaymentEventRow>(
      'select * from payment_events where processed_at is null order by occurred_at asc limit $1',
      [limit],
    );
  }

  async getSubscriptionByExternalId(externalSubId: string) {
    return one(
      await this.db.query<SubscriptionRow>(
        'select * from subscriptions where external_sub_id = $1',
        [externalSubId],
      ),
    );
  }
  async getSubscriptionByProfile(profileId: string) {
    return one(
      await this.db.query<SubscriptionRow>(
        'select * from subscriptions where profile_id = $1 order by created_at desc limit 1',
        [profileId],
      ),
    );
  }
  async createSubscription(i: Partial<SubscriptionRow> & { profile_id: string }) {
    return (
      await this.db.query<SubscriptionRow>(
        `insert into subscriptions
           (profile_id, external_sub_id, external_product_id, state, price_cents,
            trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end)
         values ($1::uuid,$2,$3,coalesce($4::text,'trialing')::subscription_state,coalesce($5,100),
                 $6::timestamptz,$7::timestamptz,$8::timestamptz,coalesce($9,false))
         returning *`,
        [
          i.profile_id,
          i.external_sub_id ?? null,
          i.external_product_id ?? null,
          i.state ?? null,
          i.price_cents ?? null,
          i.trial_started_at ?? null,
          i.trial_ends_at ?? null,
          i.current_period_end ?? null,
          i.cancel_at_period_end ?? null,
        ],
      )
    )[0]!;
  }
  async updateSubscription(id: string, patch: Partial<SubscriptionRow>) {
    const casts: Record<string, string> = {
      external_sub_id: '',
      external_product_id: '',
      state: '::subscription_state',
      price_cents: '::integer',
      trial_started_at: '::timestamptz',
      trial_ends_at: '::timestamptz',
      current_period_end: '::timestamptz',
      cancel_at_period_end: '::boolean',
      cancelled_at: '::timestamptz',
      reactivated_at: '::timestamptz',
    };
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in casts)) continue;
      vals.push(v);
      sets.push(`${k} = $${vals.length}${casts[k]}`);
    }
    if (!sets.length) return (await this.db.query<SubscriptionRow>('select * from subscriptions where id=$1', [id]))[0]!;
    vals.push(id);
    return (
      await this.db.query<SubscriptionRow>(
        `update subscriptions set ${sets.join(', ')}, updated_at = now() where id = $${vals.length} returning *`,
        vals,
      )
    )[0]!;
  }
  async listSubscriptionsDueToExpire(nowIso: string) {
    return this.db.query<SubscriptionRow>(
      `select * from subscriptions
       where cancel_at_period_end and state <> 'cancelled'
         and current_period_end is not null and current_period_end <= $1::timestamptz`,
      [nowIso],
    );
  }

  async getReferralByReferredProfile(referredProfileId: string) {
    return one(
      await this.db.query<ReferralRow>(
        'select * from referrals where referred_profile_id = $1',
        [referredProfileId],
      ),
    );
  }
  async createReferral(i: Parameters<Repo['createReferral']>[0]) {
    return (
      await this.db.query<ReferralRow>(
        `insert into referrals
           (affiliate_id, referred_profile_id, status, first_click_at, last_click_at,
            attribution_locked, attribution_source)
         values ($1::uuid,$2::uuid,coalesce($3::text,'trial')::referral_status,
                 $4::timestamptz,$5::timestamptz,coalesce($6,true),$7)
         returning *`,
        [
          i.affiliateId,
          i.referredProfileId,
          i.status ?? null,
          i.firstClickAt ?? null,
          i.lastClickAt ?? null,
          i.attributionLocked ?? null,
          i.attributionSource,
        ],
      )
    )[0]!;
  }
  async updateReferral(id: string, patch: Partial<ReferralRow>) {
    const casts: Record<string, string> = {
      affiliate_id: '::uuid',
      status: '::referral_status',
      first_click_at: '::timestamptz',
      last_click_at: '::timestamptz',
      attribution_locked: '::boolean',
      attribution_source: '',
    };
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in casts)) continue;
      vals.push(v);
      sets.push(`${k} = $${vals.length}${casts[k]}`);
    }
    vals.push(id);
    return (
      await this.db.query<ReferralRow>(
        `update referrals set ${sets.join(', ')} where id = $${vals.length} returning *`,
        vals,
      )
    )[0]!;
  }
  async listReferralsByAffiliate(affiliateId: string, limit = 50) {
    return this.db.query<ReferralRow>(
      'select * from referrals where affiliate_id = $1 order by created_at desc limit $2',
      [affiliateId, limit],
    );
  }
  async reassignReferralsToAdmin(fromAffiliateId: string, adminId: string) {
    const r = await this.db.query<{ id: string }>(
      'update referrals set affiliate_id = $2::uuid where affiliate_id = $1::uuid returning id',
      [fromAffiliateId, adminId],
    );
    return r.length;
  }
  async ensureReferralLinks(affiliateId: string, kinds: ClickLinkKind[]) {
    for (const kind of kinds) {
      await this.db.query(
        `insert into referral_links (affiliate_id, kind, active)
         values ($1::uuid, $2::click_link_kind, true)
         on conflict (affiliate_id, kind) do update set active = true`,
        [affiliateId, kind],
      );
    }
  }
  async setReferralLinksActive(affiliateId: string, active: boolean) {
    await this.db.query('update referral_links set active = $2 where affiliate_id = $1::uuid', [
      affiliateId,
      active,
    ]);
  }

  async getCommissionForReferralEvent(referralId: string, paymentEventId: string) {
    return one(
      await this.db.query<CommissionRow>(
        'select * from commissions where referral_id = $1 and payment_event_id = $2',
        [referralId, paymentEventId],
      ),
    );
  }
  async createCommission(i: {
    affiliateId: string;
    referralId: string;
    subscriptionId: string | null;
    paymentEventId: string | null;
    amountCents: number;
    kind: CommissionKind;
    holdUntil: string;
  }) {
    return (
      await this.db.query<CommissionRow>(
        `insert into commissions
           (affiliate_id, referral_id, subscription_id, payment_event_id, amount_cents, kind, status, hold_until)
         values ($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6::commission_kind,'pending',$7::timestamptz)
         returning *`,
        [
          i.affiliateId,
          i.referralId,
          i.subscriptionId,
          i.paymentEventId,
          i.amountCents,
          i.kind,
          i.holdUntil,
        ],
      )
    )[0]!;
  }
  async updateCommission(id: string, patch: Partial<CommissionRow>) {
    const casts: Record<string, string> = {
      affiliate_id: '::uuid',
      status: '::commission_status',
      available_at: '::timestamptz',
      reversed_at: '::timestamptz',
      reversal_reason: '',
      payout_id: '::uuid',
      hold_until: '::timestamptz',
    };
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in casts)) continue;
      vals.push(v);
      sets.push(`${k} = $${vals.length}${casts[k]}`);
    }
    vals.push(id);
    return (
      await this.db.query<CommissionRow>(
        `update commissions set ${sets.join(', ')} where id = $${vals.length} returning *`,
        vals,
      )
    )[0]!;
  }
  async reverseCommissionsForPaymentEvent(paymentEventId: string, reason: string) {
    const r = await this.db.query<{ id: string }>(
      `update commissions set status = 'reversed', reversed_at = now(), reversal_reason = $2
       where payment_event_id = $1 and status not in ('paid','reversed') returning id`,
      [paymentEventId, reason],
    );
    return r.length;
  }
  async forfeitUnpaidCommissions(affiliateId: string, reason: string) {
    const r = await this.db.query<{ id: string }>(
      `update commissions set status = 'reversed', reversed_at = now(), reversal_reason = $2
       where affiliate_id = $1::uuid and status not in ('paid','reversed') returning id`,
      [affiliateId, reason],
    );
    return r.length;
  }
  async promoteEligibleCommissions(nowIso: string) {
    const r = await this.db.query<{ id: string }>(
      `update commissions set status = 'available', available_at = now()
       where status = 'pending' and hold_until <= $1::timestamptz returning id`,
      [nowIso],
    );
    return r.length;
  }
  async listCommissionsByAffiliate(affiliateId: string, limit = 50) {
    return this.db.query<CommissionRow>(
      'select * from commissions where affiliate_id = $1 order by created_at desc limit $2',
      [affiliateId, limit],
    );
  }

  async createFraudFlag(i: FraudFlagInput) {
    await this.db.query(
      `insert into fraud_flags (profile_id, type, severity, details, auto_action)
       values ($1::uuid, $2::fraud_flag_type, coalesce($3,'medium'), $4::jsonb, $5)`,
      [i.profileId, i.type, i.severity ?? null, JSON.stringify(i.details ?? null), i.autoAction ?? null],
    );
  }

  async lastAttributableClick(i: {
    visitorId?: string | null;
    email?: string | null;
    windowDays: number;
  }) {
    const cutoff = new Date(Date.now() - i.windowDays * 86400_000).toISOString();
    if (i.visitorId) {
      return one(
        await this.db.query<ClickRow>(
          `select * from clicks where visitor_id = $1::uuid and created_at >= $2::timestamptz
           order by created_at desc limit 1`,
          [i.visitorId, cutoff],
        ),
      );
    }
    return null;
  }

  async affiliateStats(affiliateId: string): Promise<AffiliateStats> {
    const rows = await this.db.query<{
      clicks: string;
      referrals: string;
      total: string;
      pending: string;
      available: string;
      month: string;
    }>(
      `select
        (select count(*) from clicks where affiliate_id = $1::uuid) as clicks,
        (select count(*) from referrals where affiliate_id = $1::uuid) as referrals,
        coalesce((select sum(amount_cents) from commissions
                  where affiliate_id = $1::uuid and status in ('paid','available','requested')), 0) as total,
        coalesce((select sum(amount_cents) from commissions
                  where affiliate_id = $1::uuid and status = 'pending'), 0) as pending,
        coalesce((select sum(amount_cents) from commissions
                  where affiliate_id = $1::uuid and status = 'available'), 0) as available,
        coalesce((select sum(amount_cents) from commissions
                  where affiliate_id = $1::uuid and status <> 'reversed'
                    and created_at >= date_trunc('month', now())), 0) as month`,
      [affiliateId],
    );
    const r = rows[0]!;
    return {
      totalClicks: Number(r.clicks),
      totalReferrals: Number(r.referrals),
      totalCommissionsCents: Number(r.total),
      pendingCents: Number(r.pending),
      availableCents: Number(r.available),
      thisMonthCents: Number(r.month),
    };
  }

  async paymentsForEmail(email: string) {
    return this.db.query<PaymentEventRow>(
      'select * from payment_events where customer_email = $1::citext order by occurred_at desc',
      [norm(email)],
    );
  }

  /* ------------------------------------------------------------ M3: payouts */

  async createPayoutRequest(input: {
    affiliateId: string;
    method: PayoutMethod;
    methodDetails: unknown;
  }): Promise<PayoutRow | null> {
    // A single writable-CTE statement doing claim+insert+link was tried first
    // (kept it atomic by construction) but Postgres doesn't reliably support
    // modifying the same target table (commissions) twice in one statement —
    // real PGlite runs silently dropped the second update. tests/repo.test.ts
    // caught it. Three sequential statements instead: still correct (each
    // step only touches rows the previous step just proved it owns), just not
    // wrapped in an app-level transaction — matching how the rest of this
    // Repo already does multi-row writes without one.
    const claimed = await this.db.query<{ id: string; amount_cents: number }>(
      `update commissions
       set status = 'requested'::commission_status
       where affiliate_id = $1::uuid and status = 'available'::commission_status
       returning id, amount_cents`,
      [input.affiliateId],
    );
    if (claimed.length === 0) return null;

    const amountCents = claimed.reduce((s, c) => s + Number(c.amount_cents), 0);
    const payout = one(
      await this.db.query<PayoutRow>(
        `insert into payouts (affiliate_id, amount_cents, status, method, method_details)
         values ($1::uuid, $2, 'requested'::payout_status, $3::payout_method, $4::jsonb)
         returning *`,
        [input.affiliateId, amountCents, input.method, JSON.stringify(input.methodDetails ?? null)],
      ),
    )!;

    await this.db.query(
      `update commissions set payout_id = $2::uuid where id = any($1::uuid[])`,
      [claimed.map((c) => c.id), payout.id],
    );
    return payout;
  }

  async getPayoutById(id: string) {
    return one(await this.db.query<PayoutRow>('select * from payouts where id = $1::uuid', [id]));
  }

  async listPayoutsByAffiliate(affiliateId: string, limit = 50) {
    return this.db.query<PayoutRow>(
      'select * from payouts where affiliate_id = $1::uuid order by requested_at desc limit $2',
      [affiliateId, limit],
    );
  }

  async listPayoutsByStatus(
    status: PayoutStatus | 'all',
    params: { page: number; pageSize: number },
  ): Promise<{ rows: AdminPayoutListRow[]; total: number }> {
    const where = status === 'all' ? '' : `where p.status = $1::payout_status`;
    const args: unknown[] = status === 'all' ? [] : [status];
    const offset = (params.page - 1) * params.pageSize;

    const [rows, countRows] = await Promise.all([
      this.db.query<AdminPayoutListRow>(
        `select p.*, pr.email as affiliate_email, pr.full_name as affiliate_full_name
         from payouts p join profiles pr on pr.id = p.affiliate_id
         ${where}
         order by p.requested_at desc
         limit $${args.length + 1} offset $${args.length + 2}`,
        [...args, params.pageSize, offset],
      ),
      this.db.query<{ count: string }>(`select count(*) from payouts p ${where}`, args),
    ]);
    return { rows, total: Number(countRows[0]?.count ?? 0) };
  }

  async approveAndPayPayout(id: string, actedBy: string): Promise<PayoutRow> {
    const rows = await this.db.query<PayoutRow>(
      `update payouts set status = 'paid'::payout_status, approved_at = now(), paid_at = now(), acted_by = $2::uuid
       where id = $1::uuid and status = 'requested'::payout_status
       returning *`,
      [id, actedBy],
    );
    const payout = one(rows);
    if (!payout) throw new Error('payout not found or not in requested status');
    await this.db.query(
      `update commissions set status = 'paid'::commission_status where payout_id = $1::uuid`,
      [id],
    );
    return payout;
  }

  async rejectPayout(id: string, actedBy: string, reason: string): Promise<PayoutRow> {
    const rows = await this.db.query<PayoutRow>(
      `update payouts set status = 'rejected'::payout_status, rejected_reason = $3, acted_by = $2::uuid
       where id = $1::uuid and status = 'requested'::payout_status
       returning *`,
      [id, actedBy, reason],
    );
    const payout = one(rows);
    if (!payout) throw new Error('payout not found or not in requested status');
    await this.db.query(
      `update commissions set status = 'available'::commission_status, payout_id = null where payout_id = $1::uuid`,
      [id],
    );
    return payout;
  }
}
