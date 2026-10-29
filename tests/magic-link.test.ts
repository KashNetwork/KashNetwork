import { beforeEach, describe, expect, it } from 'vitest';
import { cookieJar } from './setup';
import { hashPassword } from '@/server/auth/passwords';
import { setRepo } from '@/server/db';
import { InMemoryRepo } from '@/server/db/memory';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';
import { magicToken, profileIdFromMagicToken, SIGNIN_TTL_MS } from '@/server/services/magic-link';
import { GET as magicGET } from '../src/app/api/auth/magic/route';
import { POST as forgotPOST } from '../src/app/api/auth/forgot/route';

const noCtx = { params: Promise.resolve({}) };
let repo: InMemoryRepo;

const post = (body: unknown) =>
  forgotPOST(
    new Request('http://localhost/api/auth/forgot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    noCtx,
  );

async function seed() {
  const admin = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  await repo.updateProfile(admin.id, { role: 'admin', is_affiliate: true, affiliate_code: 'admin', password_hash: await hashPassword('x') });
  return admin;
}

beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
  cookieJar.clear();
});

describe('sign-in links', () => {
  it('round-trips, and expired or tampered tokens are rejected', async () => {
    const p = await repo.createProfile({ email: 'buyer@gmail.com', account_type: 'paid' });
    const t = magicToken(p.id, SIGNIN_TTL_MS);
    expect(profileIdFromMagicToken(t)).toBe(p.id);
    expect(profileIdFromMagicToken(magicToken(p.id, SIGNIN_TTL_MS, Date.now() - 2 * SIGNIN_TTL_MS))).toBeNull();
    const [id, exp] = t.split('.');
    expect(profileIdFromMagicToken(`${id}.${Number(exp) + 999999}.${t.split('.')[2]}`)).toBeNull();
    expect(profileIdFromMagicToken('nonsense')).toBeNull();
  });

  it('a valid link signs a paid member in and opens the app', async () => {
    const p = await repo.createProfile({ email: 'buyer@gmail.com', account_type: 'paid' });
    const res = await magicGET(new Request(`http://localhost/api/auth/magic?t=${magicToken(p.id, SIGNIN_TTL_MS)}`));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/app');
    expect(cookieJar.has('kn_session')).toBe(true);
  });

  it('an invalid link sends them to the login page and signs nobody in', async () => {
    const res = await magicGET(new Request('http://localhost/api/auth/magic?t=bogus'));
    expect(res.headers.get('location')).toContain('/login?link=invalid');
    expect(cookieJar.has('kn_session')).toBe(false);
  });
});

describe('forgot password', () => {
  it('answers the same for unknown and known emails, and sends one link to a paid member', async () => {
    const p = await repo.createProfile({ email: 'buyer@gmail.com', account_type: 'paid' });
    expect((await post({ email: 'nobody@gmail.com' })).status).toBe(200);
    expect((await post({ email: 'buyer@gmail.com' })).status).toBe(200);
    expect((await repo.listEmailMessagesByProfile(p.id)).filter((m) => m.subject === 'Your Kash Network sign-in link')).toHaveLength(1);
    // asking again right away does not send a second one
    await post({ email: 'buyer@gmail.com' });
    expect((await repo.listEmailMessagesByProfile(p.id)).filter((m) => m.subject === 'Your Kash Network sign-in link')).toHaveLength(1);
  });

  it('does not send to free leads', async () => {
    const p = await repo.createProfile({ email: 'lead@gmail.com', account_type: 'free' });
    await post({ email: 'lead@gmail.com' });
    expect(await repo.listEmailMessagesByProfile(p.id)).toHaveLength(0);
  });
});

describe('welcome email after purchase', () => {
  it('a paid trial sends one welcome email, even for a buyer who never opened the gate', async () => {
    await seed();
    const ev = (type: 'trial_started', txn: string) => ({
      type,
      externalTxnId: txn,
      externalSubId: 'sub_new',
      customerEmail: 'direct.buyer@gmail.com',
      amountCents: 100,
      currency: 'USD',
      affiliateRef: null,
      occurredAt: new Date().toISOString(),
      raw: {},
      dedupeKey: `${txn}:${type}`,
    });
    await ingestPaymentEvent(ev('trial_started', 'w1'), true);
    const p = await repo.getProfileByEmail('direct.buyer@gmail.com');
    expect(p?.account_type).toBe('paid');
    const welcome = (await repo.listEmailMessagesByProfile(p!.id)).filter((m) => m.subject?.startsWith('Welcome to Kash Network'));
    expect(welcome).toHaveLength(1);
    // the same payment arriving twice does not send a second welcome
    await ingestPaymentEvent(ev('trial_started', 'w1'), true);
    expect((await repo.listEmailMessagesByProfile(p!.id)).filter((m) => m.subject?.startsWith('Welcome to Kash Network'))).toHaveLength(1);
  });
});
