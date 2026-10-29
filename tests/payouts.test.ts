import { beforeEach, describe, expect, it } from 'vitest';
import { cookieJar } from './setup';
import { InMemoryRepo } from '@/server/db/memory';
import { setRepo } from '@/server/db';
import { issueSession } from '@/server/auth/session';

import { GET as myPayoutsGET, POST as myPayoutsPOST } from '../src/app/api/me/payouts/route';
import { GET as adminPayoutsGET } from '../src/app/api/admin/payouts/route';
import { PATCH as adminPayoutPATCH } from '../src/app/api/admin/payouts/[id]/route';

const json = (url: string, body?: unknown, method = 'POST') =>
  new Request(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const noCtx = { params: Promise.resolve({}) };

let repo: InMemoryRepo;

async function makeAffiliate(email: string, code: string) {
  const p = await repo.createProfile({ email, account_type: 'paid' });
  return repo.updateProfile(p.id, { is_affiliate: true, affiliate_code: code });
}

async function makeAdmin(email: string) {
  const p = await repo.createProfile({ email, account_type: 'paid', role: 'admin' });
  return repo.updateProfile(p.id, { role: 'admin' });
}

/** Directly seed an 'available' commission for an affiliate — bypasses the
 * whole payment/hold pipeline, which payments.test.ts already covers. */
async function seedAvailableCommission(affiliateId: string, amountCents: number) {
  const referral = await repo.createReferral({
    affiliateId,
    referredProfileId: (await repo.createProfile({ email: `buyer-${Math.random()}@gmail.com` })).id,
    attributionSource: 'test',
  });
  const c = await repo.createCommission({
    affiliateId,
    referralId: referral.id,
    subscriptionId: null,
    paymentEventId: null,
    amountCents,
    kind: 'recurring',
    holdUntil: new Date(Date.now() - 1000).toISOString(),
  });
  await repo.updateCommission(c.id, { status: 'available', available_at: new Date().toISOString() });
  return c;
}

beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
  cookieJar.clear();
});

describe('affiliate payout requests', () => {
  it('claims the whole available balance into one payout', async () => {
    const aff = await makeAffiliate('aff1@gmail.com', 'AFF1');
    await seedAvailableCommission(aff.id, 3000);
    await seedAvailableCommission(aff.id, 3000);
    await issueSession(aff.id, 'user');

    const res = await myPayoutsPOST(
      json('/api/me/payouts', { method: 'paypal', methodDetails: 'aff1@paypal.com' }),
      noCtx,
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.payout.amountCents).toBe(6000);
    expect(body.payout.status).toBe('requested');

    // both commissions are now claimed, not double-claimable
    const remaining = [...repo.commissions.values()].filter(
      (c) => c.affiliate_id === aff.id && c.status === 'available',
    );
    expect(remaining).toHaveLength(0);

    const list = await myPayoutsGET(json('/api/me/payouts', undefined, 'GET'), noCtx);
    expect((await list.json()).payouts).toHaveLength(1);
  });

  it('rejects a request below the payout minimum', async () => {
    const aff = await makeAffiliate('aff2@gmail.com', 'AFF2');
    await seedAvailableCommission(aff.id, 1000); // $10, min is $30
    await issueSession(aff.id, 'user');

    const res = await myPayoutsPOST(
      json('/api/me/payouts', { method: 'paypal', methodDetails: 'aff2@paypal.com' }),
      noCtx,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('below_minimum');
    // nothing claimed
    const c = [...repo.commissions.values()].find((c) => c.affiliate_id === aff.id)!;
    expect(c.status).toBe('available');
  });

  it('non-affiliates cannot request a payout', async () => {
    const p = await repo.createProfile({ email: 'notaff@gmail.com', account_type: 'paid' });
    await issueSession(p.id, 'user');
    const res = await myPayoutsPOST(
      json('/api/me/payouts', { method: 'paypal', methodDetails: 'x@y.com' }),
      noCtx,
    );
    expect(res.status).toBe(403);
  });

  it('freezes cashouts while the affiliate is past due on their own membership', async () => {
    const aff = await makeAffiliate('pastdue@gmail.com', 'PASTDUE');
    await seedAvailableCommission(aff.id, 6000);
    await repo.createSubscription({ profile_id: aff.id, state: 'past_due' });
    await issueSession(aff.id, 'user');

    const res = await myPayoutsPOST(
      json('/api/me/payouts', { method: 'paypal', methodDetails: 'pastdue@paypal.com' }),
      noCtx,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('membership_past_due');

    // the commission itself is untouched — not forfeited, just not payable yet
    const c = [...repo.commissions.values()].find((c) => c.affiliate_id === aff.id)!;
    expect(c.status).toBe('available');
  });
});

describe('admin payout approval', () => {
  async function requestedPayout() {
    const aff = await makeAffiliate('aff3@gmail.com', 'AFF3');
    await seedAvailableCommission(aff.id, 5000);
    const payout = await repo.createPayoutRequest({
      affiliateId: aff.id,
      method: 'cashapp',
      methodDetails: { destination: '$aff3' },
    });
    return { aff, payout: payout! };
  }

  it('approve & mark paid moves the payout and its commissions to paid', async () => {
    const { payout } = await requestedPayout();
    const admin = await makeAdmin('admin1@kash.network');
    await issueSession(admin.id, 'user');

    const res = await adminPayoutPATCH(json(`/api/admin/payouts/${payout.id}`, { action: 'approve' }, 'PATCH'), ctx(payout.id));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.payout.status).toBe('paid');
    expect(body.payout.paidAt).toBeTruthy();

    const commissions = [...repo.commissions.values()].filter((c) => c.payout_id === payout.id);
    expect(commissions.every((c) => c.status === 'paid')).toBe(true);
  });

  it('reject reverts the linked commissions back to available', async () => {
    const { aff, payout } = await requestedPayout();
    const admin = await makeAdmin('admin2@kash.network');
    await issueSession(admin.id, 'user');

    const res = await adminPayoutPATCH(
      json(`/api/admin/payouts/${payout.id}`, { action: 'reject', reason: 'wrong details' }, 'PATCH'),
      ctx(payout.id),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).payout.status).toBe('rejected');

    const commissions = [...repo.commissions.values()].filter((c) => c.affiliate_id === aff.id);
    expect(commissions.every((c) => c.status === 'available' && c.payout_id === null)).toBe(true);
  });

  it('cannot act on a payout twice', async () => {
    const { payout } = await requestedPayout();
    const admin = await makeAdmin('admin3@kash.network');
    await issueSession(admin.id, 'user');

    await adminPayoutPATCH(json(`/api/admin/payouts/${payout.id}`, { action: 'approve' }, 'PATCH'), ctx(payout.id));
    const again = await adminPayoutPATCH(
      json(`/api/admin/payouts/${payout.id}`, { action: 'approve' }, 'PATCH'),
      ctx(payout.id),
    );
    expect(again.status).toBe(409);
  });

  it('lists requested payouts for the admin queue', async () => {
    await requestedPayout();
    const admin = await makeAdmin('admin4@kash.network');
    await issueSession(admin.id, 'user');

    const res = await adminPayoutsGET(json('/api/admin/payouts?status=requested', undefined, 'GET'), noCtx);
    const body = await res.json();
    expect(body.total).toBe(1);
    expect(body.rows[0].affiliateEmail).toBe('aff3@gmail.com');
  });
});

describe('payout minimum is $30', () => {
  it('accepts exactly $30 and rejects $29.99', async () => {
    const under = await makeAffiliate('under@gmail.com', 'UNDR');
    await seedAvailableCommission(under.id, 2999);
    await issueSession(under.id, 'user');
    const no = await myPayoutsPOST(json('/api/me/payouts', { method: 'paypal', methodDetails: 'under@paypal.com' }), noCtx);
    expect(no.status).toBe(400);

    cookieJar.clear();
    const exact = await makeAffiliate('exact@gmail.com', 'EXCT');
    await seedAvailableCommission(exact.id, 3000);
    await issueSession(exact.id, 'user');
    const yes = await myPayoutsPOST(json('/api/me/payouts', { method: 'paypal', methodDetails: 'exact@paypal.com' }), noCtx);
    expect(yes.status).toBeLessThan(300);
  });
});
