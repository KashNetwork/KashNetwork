import type { Repo } from './repo';
import type { SqlClient } from './sql';
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
    return {
      activePaid: Number(r.active_paid),
      freeLeads: Number(r.free_leads),
      cancelled: Number(r.cancelled),
      totalProfiles: Number(r.total),
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
}
