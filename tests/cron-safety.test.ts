import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRepo } from '@/server/db/memory';
import { setRepo } from '@/server/db';
import { hashPassword } from '@/server/auth/passwords';
import { runNurtureSequenceTick } from '@/server/services/email-sequence';
import { GET as healthGET } from '../src/app/api/health/route';
import { GET as cronGET } from '../src/app/api/cron/tick/route';

const noCtx = { params: Promise.resolve({}) };
let repo: InMemoryRepo;

beforeEach(async () => {
  repo = new InMemoryRepo();
  setRepo(repo);
  const a = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  await repo.updateProfile(a.id, { role: 'admin', is_affiliate: true, affiliate_code: 'admin', password_hash: await hashPassword('x') });
});

const health = async (strict = false) => {
  const res = await healthGET(new Request('http://localhost/api/health' + (strict ? '?strict=1' : '')));
  return { status: res.status, body: await res.json() };
};

describe('scheduled job monitoring', () => {
  it('reports the job as stalled until it has run, and strict mode answers 503', async () => {
    const lenient = await health();
    expect(lenient.status).toBe(200);
    expect(lenient.body.cron.stale).toBe(true);
    expect((await health(true)).status).toBe(503);
  });

  it('records each run, then reports healthy', async () => {
    await cronGET(new Request('http://localhost/api/cron/tick'), noCtx);
    const strict = await health(true);
    expect(strict.status).toBe(200);
    expect(strict.body.cron.stale).toBe(false);
    expect(strict.body.cron.minutesAgo).toBeLessThanOrEqual(1);
  });

  it('flags a run that is older than 45 minutes', async () => {
    await repo.setSetting('cron_last_run', { at: new Date(Date.now() - 50 * 60_000).toISOString() });
    expect((await health(true)).status).toBe(503);
    await repo.setSetting('cron_last_run', { at: new Date(Date.now() - 20 * 60_000).toISOString() });
    expect((await health(true)).status).toBe(200);
  });
});

describe('catching up after an outage', () => {
  it('never sends a burst: the next email is at least 20 hours away even when the lead is days behind', async () => {
    const lead = await repo.createProfile({ email: 'late.lead@gmail.com', account_type: 'free' });
    await repo.createLeadState({ profileId: lead.id, sequence: 'free_nurture', emailAffiliateId: null, nextSendAt: new Date(Date.now() - 1000).toISOString() });
    // pretend the lead signed up 5 days ago, so later emails are all "overdue"
    await repo.updateLeadState(lead.id, { entered_at: new Date(Date.now() - 5 * 86_400_000).toISOString() });
    await runNurtureSequenceTick(repo, 10, true);
    const state = (await repo.getLeadStateByProfile(lead.id))!;
    const hoursAway = (new Date(state.next_send_at!).getTime() - Date.now()) / 3_600_000;
    expect(hoursAway).toBeGreaterThan(19.5);
    // and a second tick right away sends nothing more
    expect((await runNurtureSequenceTick(repo, 10, true)).sent).toBe(0);
  });
});
