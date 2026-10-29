import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.INBOUND_EMAIL_SECRET = 'test-secret';
});

import { hashPassword } from '@/server/auth/passwords';
import { setRepo } from '@/server/db';
import { InMemoryRepo } from '@/server/db/memory';
import { AI_INTRO, AI_NAME, handleInboundEmail, MAX_AI_REPLIES_PER_THREAD, stopForBadAddress } from '@/server/services/ai-agent';
import { runNurtureSequenceTick } from '@/server/services/email-sequence';
import { parseInboundEmail } from '@/server/adapters/inbound-email';
import { POST as inboundPOST } from '../src/app/api/webhooks/inbound-email/route';

let repo: InMemoryRepo;

const mail = (over: Partial<Parameters<typeof handleInboundEmail>[1]> = {}) => ({
  from: 'jane.doe@gmail.com',
  to: 'harley@go.kash.network',
  subject: 'Re: quick question',
  text: 'How does this actually work?',
  html: null,
  inReplyToProviderId: null,
  receivedAt: new Date().toISOString(),
  ...over,
});

async function seed() {
  const admin = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  await repo.updateProfile(admin.id, { role: 'admin', is_affiliate: true, affiliate_code: 'admin', password_hash: await hashPassword('x') });
  const lead = await repo.createProfile({ email: 'jane.doe@gmail.com', account_type: 'free' });
  await repo.createLeadState({ profileId: lead.id, sequence: 'free_nurture', emailAffiliateId: admin.id, nextSendAt: new Date(Date.now() + 86_400_000).toISOString() });
  return lead;
}

beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
});

describe('AI email agent', () => {
  it('answers a lead, stops their drip sequence, and records the thread', async () => {
    const lead = await seed();
    const r = await handleInboundEmail(repo, mail());
    expect(r.action).toBe('replied');
    expect((await repo.getLeadStateByProfile(lead.id))?.sequence_status).toBe('stopped');
    const msgs = await repo.listEmailMessagesByProfile(lead.id);
    expect(msgs.some((m) => m.direction === 'inbound')).toBe(true);
    const out = msgs.find((m) => m.direction === 'outbound');
    expect(out?.ai_generated).toBe(true);
    expect(out?.body_text).not.toContain('{{affiliate_link}}');
    expect(out?.body_text).toContain('/api/auth/lead?t=');
    expect(out?.body_text).toContain('ref=admin');
    expect((await repo.getAiThread(lead.id))?.message_count).toBe(1);
  });

  it('honours unsubscribe: stops everything, sends no reply', async () => {
    const lead = await seed();
    const r = await handleInboundEmail(repo, mail({ text: 'Please unsubscribe me.' }));
    expect(r.action).toBe('unsubscribed');
    expect((await repo.getLeadStateByProfile(lead.id))?.sequence_status).toBe('stopped');
    const msgs = await repo.listEmailMessagesByProfile(lead.id);
    expect(msgs.filter((m) => m.direction === 'outbound')).toHaveLength(0);
  });

  it('sends money / legal / complaint messages to a person instead of the AI', async () => {
    const lead = await seed();
    const r = await handleInboundEmail(repo, mail({ text: 'I want a refund, this looks like a scam.' }));
    expect(r.action).toBe('escalated');
    expect(repo.tickets).toHaveLength(1);
    expect(repo.tickets[0]!.from_email).toBe('jane.doe@gmail.com');
    const msgs = await repo.listEmailMessagesByProfile(lead.id);
    expect(msgs.filter((m) => m.direction === 'outbound')).toHaveLength(0);
  });

  it('does not let the AI answer unknown senders writing to Harley', async () => {
    await seed();
    const r = await handleInboundEmail(repo, mail({ from: 'stranger@gmail.com' }));
    expect(r.action).toBe('escalated');
    expect(repo.tickets[0]!.profile_id).toBeNull();
  });

  it('hands the thread to a person after the reply limit', async () => {
    await seed();
    for (let i = 0; i < MAX_AI_REPLIES_PER_THREAD; i++) {
      expect((await handleInboundEmail(repo, mail({ text: `question ${i}` }))).action).toBe('replied');
    }
    const r = await handleInboundEmail(repo, mail({ text: 'one more question' }));
    expect(r.action).toBe('escalated');
  });

  it('ignores auto-replies, bounces and its own mail', async () => {
    await seed();
    expect((await handleInboundEmail(repo, mail({ from: 'mailer-daemon@googlemail.com' }))).action).toBe('ignored');
    expect((await handleInboundEmail(repo, mail({ subject: 'Out of office: back Monday' }))).action).toBe('ignored');
    expect((await handleInboundEmail(repo, mail({ from: 'Harley <harley@go.kash.network>' }))).action).toBe('ignored');
  });

  it('support@ lane answers a customer question from a stranger', async () => {
    await seed();
    const r = await handleInboundEmail(repo, mail({ from: 'newperson@gmail.com', to: 'support@app.kash.network', text: 'How do I log in?' }));
    expect(r.action).toBe('replied');
  });
});

describe('inbound email endpoint', () => {
  const post = (body: unknown, secret?: string) =>
    inboundPOST(
      new Request('http://localhost/api/webhooks/inbound-email' + (secret ? `?secret=${secret}` : ''), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );

  it('rejects calls without the secret', async () => {
    expect((await post({ from: 'a@b.com', to: 'harley@x.com' })).status).toBe(401);
    expect((await post({ from: 'a@b.com', to: 'harley@x.com' }, 'wrong')).status).toBe(401);
  });

  it('processes a valid call and rejects bad payloads', async () => {
    await seed();
    const ok = await post({ from: 'jane.doe@gmail.com', to: 'harley@go.kash.network', subject: 'hi', text: 'tell me more' }, 'test-secret');
    expect(ok.status).toBe(200);
    expect((await ok.json()).action).toBe('replied');
    expect((await post({ subject: 'no addresses' }, 'test-secret')).status).toBe(400);
  });

  it('parses a Resend-style event', async () => {
    const m = await parseInboundEmail({ type: 'email.received', data: { from: 'Jane <jane@x.com>', to: ['harley@go.kash.network'], subject: 's', text: 'hello' } });
    expect(m.from).toBe('Jane <jane@x.com>');
    expect(m.to).toBe('harley@go.kash.network');
    expect(m.text).toBe('hello');
  });
});

describe('bounces and spam complaints', () => {
  it('stop the sequence for that address', async () => {
    const lead = await seed();
    expect(await stopForBadAddress(repo, { data: { to: ['jane.doe@gmail.com'] } })).toBe(true);
    expect((await repo.getLeadStateByProfile(lead.id))?.sequence_status).toBe('stopped');
  });

  it('ignore addresses we do not know, and the endpoint accepts a bounce event', async () => {
    await seed();
    expect(await stopForBadAddress(repo, { data: { to: ['nobody@gmail.com'] } })).toBe(false);
    const res = await inboundPOST(
      new Request('http://localhost/api/webhooks/inbound-email?secret=test-secret', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'email.bounced', data: { to: ['jane.doe@gmail.com'] } }),
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).action).toBe('delivery_problem');
  });
});

describe('AI identity and affiliate links', () => {
  it("the first AI reply opens with the exact introduction, later ones do not, and it is sent as Kash", async () => {
    const lead = await seed();
    await handleInboundEmail(repo, mail({ text: 'How does this work?' }));
    await handleInboundEmail(repo, mail({ text: 'And can I cancel?' }));
    const replies = (await repo.listEmailMessagesByProfile(lead.id)).filter((m) => m.direction === 'outbound');
    expect(replies).toHaveLength(2);
    // exactly one of the two (the first) carries the introduction, at the very start
    expect(replies.filter((m) => m.body_text!.startsWith(AI_INTRO))).toHaveLength(1);
    expect(replies.filter((m) => m.body_text!.includes(AI_INTRO))).toHaveLength(1);
    expect(replies.every((m) => m.from_addr.includes(AI_NAME))).toBe(true);
  });

  it("every sequence email carries the credited affiliate's own in-account link", async () => {
    const admin = await seed().then(() => repo.getProfileByEmail('admin@kash.network'));
    const aff = await repo.createProfile({ email: 'affiliate.one@gmail.com', account_type: 'paid' });
    await repo.updateProfile(aff.id, { is_affiliate: true, affiliate_code: 'AFF123' });
    const lead = await repo.createProfile({ email: 'referred.lead@gmail.com', account_type: 'free' });
    await repo.createLeadState({ profileId: lead.id, sequence: 'free_nurture', emailAffiliateId: aff.id, nextSendAt: new Date(Date.now() - 1000).toISOString() });
    await runNurtureSequenceTick(repo, 10, true);
    const sent = (await repo.listEmailMessagesByProfile(lead.id)).find((m) => m.direction === 'outbound');
    expect(sent?.body_text).toContain('/api/auth/lead?t=');
    expect(sent?.body_text).toContain('ref=AFF123');
    expect(sent?.body_text).not.toContain('/trial');
    expect(admin).toBeTruthy();
  });
});
