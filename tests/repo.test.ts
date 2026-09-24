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

/** M3 payouts — the writable-CTE claim in createPayoutRequest is the riskiest
 * bit of raw SQL in the project (one statement doing a conditional
 * update+insert+update); this is what actually proves it against real
 * Postgres semantics, not just the in-memory fake. */
describe('SqlRepo payouts via PGlite', () => {
  it('atomically claims available commissions into one payout, then approve/reject round-trip', async () => {
    const aff = await repo.createProfile({ email: 'sql-payout-aff@gmail.com', account_type: 'paid' });
    await repo.updateProfile(aff.id, { is_affiliate: true, affiliate_code: 'SQLPAY' });
    const buyer = await repo.createProfile({ email: 'sql-payout-buyer@gmail.com' });
    const referral = await repo.createReferral({
      affiliateId: aff.id,
      referredProfileId: buyer.id,
      attributionSource: 'test',
    });

    const c1 = await repo.createCommission({
      affiliateId: aff.id,
      referralId: referral.id,
      subscriptionId: null,
      paymentEventId: null,
      amountCents: 3000,
      kind: 'recurring',
      holdUntil: new Date(Date.now() - 1000).toISOString(),
    });
    const c2 = await repo.createCommission({
      affiliateId: aff.id,
      referralId: referral.id,
      subscriptionId: null,
      paymentEventId: null,
      amountCents: 2500,
      kind: 'recurring',
      holdUntil: new Date(Date.now() - 1000).toISOString(),
    });
    await repo.updateCommission(c1.id, { status: 'available' });
    await repo.updateCommission(c2.id, { status: 'available' });

    // nothing to claim yet for an affiliate with no available commissions
    const admin = await repo.createProfile({ email: 'sql-payout-admin@kash.network', role: 'admin' });
    const nothing = await repo.createPayoutRequest({
      affiliateId: admin.id,
      method: 'paypal',
      methodDetails: { destination: 'x@y.com' },
    });
    expect(nothing).toBeNull();

    const payout = await repo.createPayoutRequest({
      affiliateId: aff.id,
      method: 'paypal',
      methodDetails: { destination: 'sql-payout-aff@paypal.com' },
    });
    expect(payout).toBeTruthy();
    expect(payout!.amount_cents).toBe(5500);
    expect(payout!.status).toBe('requested');

    // both commissions claimed, linked to the payout, no longer available
    const claimed = await repo.listCommissionsByAffiliate(aff.id);
    expect(claimed.every((c) => c.status === 'requested' && c.payout_id === payout!.id)).toBe(true);

    // a second request right after has nothing left to claim
    const second = await repo.createPayoutRequest({
      affiliateId: aff.id,
      method: 'paypal',
      methodDetails: { destination: 'sql-payout-aff@paypal.com' },
    });
    expect(second).toBeNull();

    const listed = await repo.listPayoutsByStatus('requested', { page: 1, pageSize: 10 });
    expect(listed.rows.some((r) => r.id === payout!.id && r.affiliate_email === 'sql-payout-aff@gmail.com')).toBe(
      true,
    );

    const approved = await repo.approveAndPayPayout(payout!.id, admin.id);
    expect(approved.status).toBe('paid');
    expect(approved.paid_at).toBeTruthy();
    const paidCommissions = await repo.listCommissionsByAffiliate(aff.id);
    expect(paidCommissions.every((c) => c.status === 'paid')).toBe(true);

    await expect(repo.approveAndPayPayout(payout!.id, admin.id)).rejects.toThrow();
  });

  it('reject reverts claimed commissions back to available', async () => {
    const aff = await repo.createProfile({ email: 'sql-payout-aff2@gmail.com', account_type: 'paid' });
    await repo.updateProfile(aff.id, { is_affiliate: true, affiliate_code: 'SQLPAY2' });
    const buyer = await repo.createProfile({ email: 'sql-payout-buyer2@gmail.com' });
    const referral = await repo.createReferral({
      affiliateId: aff.id,
      referredProfileId: buyer.id,
      attributionSource: 'test',
    });
    const c = await repo.createCommission({
      affiliateId: aff.id,
      referralId: referral.id,
      subscriptionId: null,
      paymentEventId: null,
      amountCents: 6000,
      kind: 'recurring',
      holdUntil: new Date(Date.now() - 1000).toISOString(),
    });
    await repo.updateCommission(c.id, { status: 'available' });

    const admin = await repo.createProfile({ email: 'sql-payout-admin2@kash.network', role: 'admin' });
    const payout = await repo.createPayoutRequest({
      affiliateId: aff.id,
      method: 'bank',
      methodDetails: { destination: 'acct 123' },
    });
    const rejected = await repo.rejectPayout(payout!.id, admin.id, 'suspicious activity');
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejected_reason).toBe('suspicious activity');

    const after = await repo.listCommissionsByAffiliate(aff.id);
    expect(after.find((r) => r.id === c.id)?.status).toBe('available');
    expect(after.find((r) => r.id === c.id)?.payout_id).toBeNull();
  });
});

type ProfileDetails = Record<string, unknown>;
