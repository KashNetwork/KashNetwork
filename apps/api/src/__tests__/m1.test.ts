import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { InMemoryRepo } from '../db/memory.js';
import { setRepo } from '../db/index.js';
import { hashPassword } from '../auth/passwords.js';

const app = createApp();
let repo: InMemoryRepo;

beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
});

describe('video-gate lead capture', () => {
  it('creates a passwordless free/lead account and sets a session', async () => {
    const res = await request(app).post('/api/leads').send({ email: 'jane@gmail.com' });
    expect(res.status).toBe(201);
    expect(res.body.me.accountType).toBe('free');
    expect(res.body.me.freeVariant).toBe('lead');
    expect(res.body.me.tabs).toEqual(['harleys_story']);
    expect(res.body.me.affiliate).toBeNull();
    expect([res.headers['set-cookie']].flat().join()).toContain('kn_session');
  });

  it('rejects invalid / disposable emails (video stays locked)', async () => {
    const bad = await request(app).post('/api/leads').send({ email: 'x@mailinator.com' });
    expect(bad.status).toBe(400);
    expect(bad.body.error).toBe('invalid_email');

    const syntax = await request(app).post('/api/leads').send({ email: 'not-an-email' });
    expect(syntax.status).toBe(400);
  });

  it('is idempotent for an existing lead (re-issues session)', async () => {
    await request(app).post('/api/leads').send({ email: 'dup@gmail.com' });
    const again = await request(app).post('/api/leads').send({ email: 'dup@gmail.com' });
    expect(again.status).toBe(200);
    expect(again.body.created).toBe(false);
    expect(repo.profiles.size).toBe(1);
  });

  it('blocks re-registration when a paid account exists', async () => {
    const p = await repo.createProfile({ email: 'paid@gmail.com', account_type: 'paid' });
    await repo.updateProfile(p.id, { password_hash: await hashPassword('secret123') });
    const res = await request(app).post('/api/leads').send({ email: 'paid@gmail.com' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('account_exists');
  });

  it('attributes to an active affiliate via ?ref', async () => {
    const aff = await repo.createProfile({ email: 'aff@gmail.com', account_type: 'paid' });
    await repo.updateProfile(aff.id, { is_affiliate: true, affiliate_code: 'AFF123' });
    const res = await request(app)
      .post('/api/leads')
      .send({ email: 'ref@gmail.com', ref: 'AFF123' });
    expect(res.status).toBe(201);
    const lead = await repo.getProfileByEmail('ref@gmail.com');
    expect(lead?.referred_by_affiliate_id).toBe(aff.id);
  });
});

describe('paid auth + tabs', () => {
  async function makePaid(email: string, pw: string) {
    const p = await repo.createProfile({ email, account_type: 'paid', full_name: 'Paid User' });
    await repo.updateProfile(p.id, {
      password_hash: await hashPassword(pw),
      is_affiliate: true,
      affiliate_code: 'PAIDX',
    });
    return p;
  }

  it('logs in and returns the paid tab set + affiliate links', async () => {
    await makePaid('p@gmail.com', 'password1');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'p@gmail.com', password: 'password1' });
    expect(res.status).toBe(200);
    expect(res.body.me.tabs).toEqual([
      'dashboard',
      'commissions',
      'buy_traffic',
      'support',
      'profile',
      'cancel_subscription',
    ]);
    expect(res.body.me.affiliate.links.landing).toContain('/trial?ref=PAIDX');
  });

  it('rejects a bad password', async () => {
    await makePaid('p2@gmail.com', 'password1');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'p2@gmail.com', password: 'nope' });
    expect(res.status).toBe(401);
  });

  it('GET /api/me requires a session', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
  });

  it('logout revokes the session', async () => {
    const agent = request.agent(app);
    await makePaid('p3@gmail.com', 'password1');
    await agent.post('/api/auth/login').send({ email: 'p3@gmail.com', password: 'password1' });
    expect((await agent.get('/api/me')).status).toBe(200);
    await agent.post('/api/auth/logout');
    expect((await agent.get('/api/me')).status).toBe(401);
  });
});

describe('admin', () => {
  async function adminAgent() {
    const a = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid' });
    await repo.updateProfile(a.id, {
      role: 'admin',
      password_hash: await hashPassword('adminpass1'),
    });
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ email: 'admin@kash.network', password: 'adminpass1' });
    return agent;
  }

  it('overview + user list are admin-only', async () => {
    const anon = await request(app).get('/api/admin/overview');
    expect(anon.status).toBe(401);

    const agent = await adminAgent();
    await request(app).post('/api/leads').send({ email: 'lead1@gmail.com' });

    const ov = await agent.get('/api/admin/overview');
    expect(ov.status).toBe(200);
    expect(ov.body.freeLeads).toBe(1);

    const users = await agent.get('/api/admin/users?filter=free_leads');
    expect(users.body.total).toBe(1);
    expect(users.body.rows[0].email).toBe('lead1@gmail.com');
  });

  it('status override writes an audit row', async () => {
    const agent = await adminAgent();
    const lead = await repo.createProfile({ email: 'promote@gmail.com' });
    const res = await agent
      .patch(`/api/admin/users/${lead.id}`)
      .send({ accountType: 'paid', isAffiliate: true });
    expect(res.status).toBe(200);
    expect(res.body.user.account_type).toBe('paid');
    expect(repo.audits.at(-1)?.action).toBe('user.status_override');
  });
});

describe('the admin tab set', () => {
  it('is the reduced set (no products/campaigns/training)', async () => {
    const a = await repo.createProfile({ email: 'a2@kash.network', account_type: 'paid' });
    await repo.updateProfile(a.id, {
      role: 'admin',
      password_hash: await hashPassword('adminpass1'),
    });
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({ email: 'a2@kash.network', password: 'adminpass1' });
    expect(res.body.me.tabs).toEqual([
      'dashboard',
      'customers',
      'payouts',
      'support',
      'profile',
      'admin',
    ]);
  });
});
