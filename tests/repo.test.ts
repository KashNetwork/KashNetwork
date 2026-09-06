import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hashPassword } from '@/server/auth/passwords';
import { runMigrations } from '@/server/db/migrate';
import { makeSqlClient, type SqlClient } from '@/server/db/sql';
import { SqlRepo } from '@/server/db/sqlrepo';

/** Exercises the real SQL repo (production path) against in-memory PGlite. */
let client: SqlClient;
let repo: SqlRepo;

beforeAll(async () => {
  client = await makeSqlClient({ pgliteDir: 'memory://' });
  const ran = await runMigrations(client);
  expect(ran).toContain('0001_initial_schema.sql');
  repo = new SqlRepo(client);
}, 60_000);

afterAll(async () => {
  await client.end();
});

describe('SqlRepo via PGlite', () => {
  it('creates + reads a lead profile', async () => {
    const p = await repo.createProfile({
      email: 'SQL-Lead@Gmail.com',
      account_type: 'free',
      free_variant: 'lead',
      email_verified_at: new Date().toISOString(),
    });
    expect(p.email).toBe('sql-lead@gmail.com');
    const back = await repo.getProfileByEmail('sql-lead@gmail.com');
    expect(back?.id).toBe(p.id);
  });

  it('updates enum + jsonb columns without cast errors', async () => {
    const p = await repo.createProfile({ email: 'sql-paid@gmail.com' });
    const updated = await repo.updateProfile(p.id, {
      account_type: 'paid',
      is_affiliate: true,
      affiliate_code: 'SQLX',
      password_hash: await hashPassword('password1'),
      payout_method: 'paypal',
      payout_details: { paypal_email: 'x@y.com' } as unknown as ProfileDetails,
    });
    expect(updated.account_type).toBe('paid');
    expect(updated.affiliate_code).toBe('SQLX');
  });

  it('sessions + clicks + audit round-trip', async () => {
    const aff = await repo.getProfileByAffiliateCode('SQLX');
    expect(aff).toBeTruthy();

    const s = await repo.createSession({
      profileId: aff!.id,
      tokenHash: 'hash123',
      kind: 'user',
      ip: '::1',
      userAgent: 'vitest',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
    });
    expect((await repo.getSessionByTokenHash('hash123'))?.id).toBe(s.id);

    await repo.createClick({
      affiliate_id: aff!.id,
      link_kind: 'landing',
      visitor_id: null,
      ip: '10.0.0.1',
      user_agent: 'vitest',
      referer: null,
      landing_path: '/trial',
    });

    await repo.createAudit({
      adminId: aff!.id,
      action: 'test',
      targetType: 'profile',
      targetId: aff!.id,
      after: { x: 1 },
    });
    const n = await client.query<{ n: string }>('select count(*) n from admin_audit');
    expect(Number(n[0]!.n)).toBe(1);
  });

  it('adminOverview + adminListUsers work', async () => {
    const o = await repo.adminOverview();
    expect(o.activePaid).toBeGreaterThanOrEqual(1);
    const list = await repo.adminListUsers({ filter: 'all', page: 1, pageSize: 25 });
    expect(list.total).toBeGreaterThanOrEqual(1);
  });
});

type ProfileDetails = Record<string, unknown>;
