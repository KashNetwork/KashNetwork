import { beforeEach, describe, expect, it } from 'vitest';
import { cookieJar } from './setup';
import { InMemoryRepo } from '@/server/db/memory';
import { setRepo } from '@/server/db';
import { hashPassword } from '@/server/auth/passwords';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';
import { runNurtureSequenceTick, markLeadConverted } from '@/server/services/email-sequence';
import { FREE_NURTURE_SEQUENCE } from '@/content/email-sequence';

import { POST as leadsPOST } from '../src/app/api/leads/route';
import { GET as cronGET } from '../src/app/api/cron/tick/route';

const json = (url: string, body?: unknown, method = 'POST') =>
  new Request(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const noCtx = { params: Promise.resolve({}) };

let repo: InMemoryRepo;

async function seedAdmin() {
  const a = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  return repo.updateProfile(a.id, {
    role: 'admin',
    is_affiliate: true,
    affiliate_code: 'admin',
    password_hash: await hashPassword('x'),
  });
}

async function makeAffiliate(email: string, code: string) {
  const p = await repo.createProfile({ email, account_type: 'paid' });
  return repo.updateProfile(p.id, { is_affiliate: true, affiliate_code: code });
}

beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
  cookieJar.clear();
});

describe('lead nurture sequence — signup', () => {
  it('creates an active lead_state on signup, crediting admin when there is no referral', async () => {
    await seedAdmin();
    const res = await leadsPOST(json('/api/leads', { email: 'lead1@gmail.com' }), noCtx);
    expect(res.status).toBe(201);
    const profileId = (await res.json()).me.id;

    const state = await repo.getLeadStateByProfile(profileId);
    expect(state?.sequence_status).toBe('active');
    expect(state?.sequence_step).toBe(0);
    expect(state?.next_send_at).toBeTruthy();

    const admin = await repo.getProfileByAffiliateCode('admin');
    expect(state?.email_affiliate_id).toBe(admin!.id);
  });

  it('credits the referring affiliate when a ref code is present', async () => {
    await seedAdmin();
    const aff = await makeAffiliate('aff@gmail.com', 'REFCODE');
    const res = await leadsPOST(json('/api/leads', { email: 'lead2@gmail.com', ref: 'REFCODE' }), noCtx);
    const profileId = (await res.json()).me.id;
    const state = await repo.getLeadStateByProfile(profileId);
    expect(state?.email_affiliate_id).toBe(aff.id);
  });

  it('does not fail account creation if attribution resolution has no admin to fall back to', async () => {
    // no seedAdmin() here — this is exactly the scenario that used to 500
    const res = await leadsPOST(json('/api/leads', { email: 'lead3@gmail.com' }), noCtx);
    expect(res.status).toBe(201);
    // no lead_state, but the account itself exists and is usable
    const profileId = (await res.json()).me.id;
    expect(await repo.getLeadStateByProfile(profileId)).toBeNull();
    expect(await repo.getProfileById(profileId)).toBeTruthy();
  });
});

describe('lead nurture sequence — production gate', () => {
  it('does nothing (and does not advance state) until real sending is configured', async () => {
    // no RESEND_API_KEY in the test env -> config.resend.enabled is false
    const p = await repo.createProfile({ email: 'gated@gmail.com', account_type: 'free' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: null,
      nextSendAt: new Date(Date.now() - 1000).toISOString(),
    });
    const result = await runNurtureSequenceTick(repo); // no force
    expect(result).toMatchObject({ sent: 0, skipped: true });
    const state = await repo.getLeadStateByProfile(p.id);
    expect(state?.sequence_step).toBe(0);
    expect(await repo.listEmailMessagesByProfile(p.id)).toHaveLength(0);
  });
});

describe('lead nurture sequence — sending (force: true bypasses the real-sending gate, see above)', () => {
  it('sends the due step, logs it, and schedules the next one', async () => {
    await seedAdmin();
    const p = await repo.createProfile({ email: 'due@gmail.com', account_type: 'free', free_variant: 'lead' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: null,
      nextSendAt: new Date(Date.now() - 1000).toISOString(), // already due
    });

    const result = await runNurtureSequenceTick(repo, 50, true);
    expect(result.sent).toBe(1);

    const state = await repo.getLeadStateByProfile(p.id);
    expect(state?.sequence_step).toBe(1);
    expect(state?.sequence_status).toBe('active');
    expect(new Date(state!.next_send_at!).getTime()).toBeGreaterThan(Date.now());

    const messages = await repo.listEmailMessagesByProfile(p.id);
    expect(messages).toHaveLength(1);
    expect(messages[0]!.direction).toBe('outbound');
    expect(messages[0]!.subject).toBe(FREE_NURTURE_SEQUENCE[0]!.subject);
    expect(messages[0]!.body_text).not.toContain('{{affiliate_link}}');
    expect(messages[0]!.body_text).toContain('/api/auth/lead?t=');
    expect(messages[0]!.body_text).toContain('ref=');
  });

  it("uses the credited affiliate's link, not admin's, when one is on file", async () => {
    await seedAdmin();
    const aff = await makeAffiliate('affy@gmail.com', 'AFFY');
    const p = await repo.createProfile({ email: 'due2@gmail.com', account_type: 'free', free_variant: 'lead' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: aff.id,
      nextSendAt: new Date(Date.now() - 1000).toISOString(),
    });

    await runNurtureSequenceTick(repo, 50, true);
    const messages = await repo.listEmailMessagesByProfile(p.id);
    expect(messages[0]!.body_text).toContain('ref=AFFY');
  });

  it('leaves non-due leads alone', async () => {
    const p = await repo.createProfile({ email: 'notdue@gmail.com', account_type: 'free' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: null,
      nextSendAt: new Date(Date.now() + 86_400_000).toISOString(), // tomorrow
    });
    const result = await runNurtureSequenceTick(repo, 50, true);
    expect(result.sent).toBe(0);
    expect((await repo.getLeadStateByProfile(p.id))!.sequence_step).toBe(0);
  });

  it('marks the sequence completed once every step has been sent', async () => {
    const p = await repo.createProfile({ email: 'graduate@gmail.com', account_type: 'free' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: null,
      nextSendAt: new Date(Date.now() - 1000).toISOString(),
    });
    // fast-forward through every step
    for (let i = 0; i < FREE_NURTURE_SEQUENCE.length; i++) {
      await runNurtureSequenceTick(repo, 50, true);
      await repo.updateLeadState(p.id, { next_send_at: new Date(Date.now() - 1000).toISOString() });
    }
    const state = await repo.getLeadStateByProfile(p.id);
    expect(state?.sequence_status).toBe('completed');
    // held emails are skipped, so only the sendable ones go out
    expect(await repo.listEmailMessagesByProfile(p.id)).toHaveLength(FREE_NURTURE_SEQUENCE.filter((s) => !s.hold).length);
  });

  it('is wired into the cron endpoint (gated off here since RESEND_API_KEY is unset in tests)', async () => {
    await seedAdmin();
    const p = await repo.createProfile({ email: 'viacron@gmail.com', account_type: 'free' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: null,
      nextSendAt: new Date(Date.now() - 1000).toISOString(),
    });
    const res = await cronGET(new Request('http://localhost/api/cron/tick'), noCtx);
    const body = await res.json();
    // proves the route really does call it, and really is gated the same way
    expect(body.nurture).toMatchObject({ sent: 0, skipped: true });
  });
});

describe('lead nurture sequence — stops on conversion', () => {
  it('stops the sequence the moment the lead buys the $1 trial', async () => {
    await seedAdmin();
    const p = await repo.createProfile({ email: 'converts@gmail.com', account_type: 'free', free_variant: 'lead' });
    await repo.createLeadState({
      profileId: p.id,
      sequence: 'free_nurture',
      emailAffiliateId: null,
      nextSendAt: new Date(Date.now() - 1000).toISOString(),
    });

    await ingestPaymentEvent(
      {
        type: 'trial_started',
        externalTxnId: 'txn1',
        externalSubId: 'sub1',
        customerEmail: 'converts@gmail.com',
        amountCents: 100,
        currency: 'USD',
        affiliateRef: null,
        occurredAt: new Date().toISOString(),
        raw: {},
        dedupeKey: 'txn1:trial_started',
      },
      true,
    );

    const state = await repo.getLeadStateByProfile(p.id);
    expect(state?.sequence_status).toBe('converted');
    expect(state?.converted_at).toBeTruthy();
    expect(state?.next_send_at).toBeNull();

    // and the cron no longer sends anything for them, even with sending forced on
    const result = await runNurtureSequenceTick(repo, 50, true);
    expect(result.sent).toBe(0);
  });

  it('markLeadConverted is a no-op for a lead with no sequence at all', async () => {
    const p = await repo.createProfile({ email: 'nostate@gmail.com', account_type: 'free' });
    await expect(markLeadConverted(repo, p.id)).resolves.toBeUndefined();
  });
});
