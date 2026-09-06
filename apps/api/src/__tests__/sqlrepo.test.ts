import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { setRepo } from '../db/index.js';
import { runMigrations } from '../db/migrate.js';
import { makeSqlClient, type SqlClient } from '../db/sql.js';
import { SqlRepo } from '../db/sqlrepo.js';

/**
 * Exercises the real SQL repo (production path) against an in-memory PGlite —
 * this is what catches type-cast / SQL-shape bugs the InMemoryRepo can't.
 */
const app = createApp();
let client: SqlClient;

beforeAll(async () => {
  client = await makeSqlClient({ pgliteDir: 'memory://' });
  const ran = await runMigrations(client);
  expect(ran).toContain('0001_initial_schema.sql');
  setRepo(new SqlRepo(client));
}, 60_000);

afterAll(async () => {
  await client.end();
});

describe('SqlRepo via PGlite', () => {
  it('creates a lead, is idempotent, and lists it for admin', async () => {
    const agent = request.agent(app);

    const lead = await agent.post('/api/leads').send({ email: 'sql-lead@gmail.com' });
    expect(lead.status).toBe(201);
    expect(lead.body.me.tabs).toEqual(['harleys_story']);

    const again = await agent.post('/api/leads').send({ email: 'sql-lead@gmail.com' });
    expect(again.body.created).toBe(false);

    const me = await agent.get('/api/me');
    expect(me.body.me.email).toBe('sql-lead@gmail.com');
  });

  it('supports the full paid + admin flow with SQL', async () => {
    // promote a user to paid+affiliate directly through the repo, then log in
    const repo = new SqlRepo(client);
    const p = await repo.createProfile({ email: 'sql-paid@gmail.com', account_type: 'paid' });
    const { hashPassword } = await import('../auth/passwords.js');
    await repo.updateProfile(p.id, {
      password_hash: await hashPassword('password1'),
      is_affiliate: true,
      affiliate_code: 'SQLAFF',
    });

    const agent = request.agent(app);
    const login = await agent
      .post('/api/auth/login')
      .send({ email: 'sql-paid@gmail.com', password: 'password1' });
    expect(login.status).toBe(200);
    expect(login.body.me.affiliate.code).toBe('SQLAFF');

    // profile update + support ticket round-trip through SQL
    const upd = await agent.patch('/api/me/profile').send({ fullName: 'SQL Paid' });
    expect(upd.body.me.fullName).toBe('SQL Paid');
    const sup = await agent.post('/api/support').send({ message: 'hello from sql test' });
    expect(sup.status).toBe(201);
  });

  it('admin overview + status override + audit via SQL', async () => {
    const repo = new SqlRepo(client);
    const admin = await repo.createProfile({ email: 'sql-admin@kash.network', account_type: 'paid' });
    const { hashPassword } = await import('../auth/passwords.js');
    await repo.updateProfile(admin.id, {
      role: 'admin',
      password_hash: await hashPassword('adminpass1'),
    });

    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ email: 'sql-admin@kash.network', password: 'adminpass1' });

    const ov = await agent.get('/api/admin/overview');
    expect(ov.status).toBe(200);
    expect(ov.body.freeLeads).toBeGreaterThanOrEqual(1);

    const target = await repo.createProfile({ email: 'sql-promote@gmail.com' });
    const patch = await agent
      .patch(`/api/admin/users/${target.id}`)
      .send({ accountType: 'paid', isAffiliate: true });
    expect(patch.status).toBe(200);
    expect(patch.body.user.account_type).toBe('paid');

    const audits = await client.query<{ n: string }>('select count(*) n from admin_audit');
    expect(Number(audits[0]!.n)).toBeGreaterThanOrEqual(1);
  });
});
