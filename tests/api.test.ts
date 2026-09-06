import { beforeEach, describe, expect, it } from 'vitest';
import { cookieJar } from './setup';
import { InMemoryRepo } from '@/server/db/memory';
import { setRepo } from '@/server/db';
import { hashPassword } from '@/server/auth/passwords';

import { POST as leadsPOST } from '../src/app/api/leads/route';
import { POST as loginPOST } from '../src/app/api/auth/login/route';
import { POST as logoutPOST } from '../src/app/api/auth/logout/route';
import { GET as meGET } from '../src/app/api/me/route';
import { GET as adminOverviewGET } from '../src/app/api/admin/overview/route';
import { GET as adminUsersGET } from '../src/app/api/admin/users/route';
import { PATCH as adminUserPATCH } from '../src/app/api/admin/users/[id]/route';

const json = (url: string, body?: unknown, method = 'POST') =>
  new Request(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const noCtx = { params: Promise.resolve({}) };

let repo: InMemoryRepo;
beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
  cookieJar.clear();
});

describe('video-gate lead capture', () => {
  it('creates a passwordless free/lead account + session', async () => {
    const res = await leadsPOST(json('/api/leads', { email: 'jane@gmail.com' }), noCtx);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.me.accountType).toBe('free');
    expect(body.me.tabs).toEqual(['harleys_story']);
    expect(cookieJar.has('kn_session')).toBe(true);
  });

  it('rejects disposable / invalid emails', async () => {
    const bad = await leadsPOST(json('/api/leads', { email: 'x@mailinator.com' }), noCtx);
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toBe('invalid_email');
  });

  it('is idempotent for an existing lead', async () => {
    await leadsPOST(json('/api/leads', { email: 'dup@gmail.com' }), noCtx);
    const again = await leadsPOST(json('/api/leads', { email: 'dup@gmail.com' }), noCtx);
    expect(again.status).toBe(200);
    expect(repo.profiles.size).toBe(1);
  });

  it('blocks re-registration once a paid account exists', async () => {
    const p = await repo.createProfile({ email: 'paid@gmail.com', account_type: 'paid' });
    await repo.updateProfile(p.id, { password_hash: await hashPassword('secret123') });
    const res = await leadsPOST(json('/api/leads', { email: 'paid@gmail.com' }), noCtx);
    expect(res.status).toBe(409);
  });
});

describe('auth + tabs', () => {
  async function makePaid(email: string, pw: string) {
    const p = await repo.createProfile({ email, account_type: 'paid', full_name: 'P' });
    await repo.updateProfile(p.id, {
      password_hash: await hashPassword(pw),
      is_affiliate: true,
      affiliate_code: 'PAIDX',
    });
    return p;
  }

  it('logs in -> paid tab set + affiliate links; /me works; logout clears', async () => {
    await makePaid('p@gmail.com', 'password1');
    const login = await loginPOST(
      json('/api/auth/login', { email: 'p@gmail.com', password: 'password1' }),
      noCtx,
    );
    expect(login.status).toBe(200);
    const me1 = await (await login.json()).me;
    expect(me1.tabs).toEqual([
      'dashboard',
      'commissions',
      'buy_traffic',
      'support',
      'profile',
      'cancel_subscription',
    ]);
    expect(me1.affiliate.links.landing).toContain('/trial?ref=PAIDX');

    const me = await meGET(json('/api/me', undefined, 'GET'), noCtx);
    expect(me.status).toBe(200);

    await logoutPOST(json('/api/auth/logout'), noCtx);
    const me2 = await meGET(json('/api/me', undefined, 'GET'), noCtx);
    expect(me2.status).toBe(401);
  });

  it('rejects a bad password', async () => {
    await makePaid('p2@gmail.com', 'password1');
    const res = await loginPOST(
      json('/api/auth/login', { email: 'p2@gmail.com', password: 'nope' }),
      noCtx,
    );
    expect(res.status).toBe(401);
  });
});

describe('admin', () => {
  async function createAdmin() {
    const a = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid' });
    await repo.updateProfile(a.id, { role: 'admin', password_hash: await hashPassword('adminpass1') });
  }
  async function loginAdmin() {
    await loginPOST(
      json('/api/auth/login', { email: 'admin@kash.network', password: 'adminpass1' }),
      noCtx,
    );
  }

  it('overview + user list are admin-gated', async () => {
    const anon = await adminOverviewGET(json('/api/admin/overview', undefined, 'GET'), noCtx);
    expect(anon.status).toBe(401);

    await createAdmin();
    await loginAdmin();
    await leadsPOST(json('/api/leads', { email: 'lead1@gmail.com' }), noCtx);
    // leadsPOST set a lead cookie — restore admin cookie by re-login
    await loginAdmin();

    const ov = await adminOverviewGET(json('/api/admin/overview', undefined, 'GET'), noCtx);
    expect(ov.status).toBe(200);
    expect((await ov.json()).freeLeads).toBe(1);

    const users = await adminUsersGET(
      json('/api/admin/users?filter=free_leads', undefined, 'GET'),
      noCtx,
    );
    expect((await users.json()).total).toBe(1);
  });

  it('status override writes an audit row', async () => {
    await createAdmin();
    await loginAdmin();
    const lead = await repo.createProfile({ email: 'promote@gmail.com' });
    const res = await adminUserPATCH(
      json(`/api/admin/users/${lead.id}`, { accountType: 'paid', isAffiliate: true }, 'PATCH'),
      { params: Promise.resolve({ id: lead.id }) },
    );
    expect(res.status).toBe(200);
    expect((await res.json()).user.account_type).toBe('paid');
    expect(repo.audits.at(-1)?.action).toBe('user.status_override');
  });
});
