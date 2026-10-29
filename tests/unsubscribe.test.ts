import { beforeEach, describe, expect, it } from 'vitest';
import { hashPassword } from '@/server/auth/passwords';
import { setRepo } from '@/server/db';
import { InMemoryRepo } from '@/server/db/memory';
import { runNurtureSequenceTick } from '@/server/services/email-sequence';
import { profileIdFromToken, unsubscribeToken } from '@/server/services/unsubscribe';
import { GET, POST } from '../src/app/api/unsubscribe/route';

let repo: InMemoryRepo;

async function seedLead() {
  const admin = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  await repo.updateProfile(admin.id, { role: 'admin', is_affiliate: true, affiliate_code: 'admin', password_hash: await hashPassword('x') });
  const lead = await repo.createProfile({ email: 'sam.lead@gmail.com', account_type: 'free' });
  await repo.createLeadState({ profileId: lead.id, sequence: 'free_nurture', emailAffiliateId: admin.id, nextSendAt: new Date(Date.now() - 1000).toISOString() });
  return lead;
}

beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
});

describe('unsubscribe', () => {
  it('tokens round-trip and forged ones are rejected', async () => {
    const lead = await seedLead();
    const t = unsubscribeToken(lead.id);
    expect(profileIdFromToken(t)).toBe(lead.id);
    expect(profileIdFromToken(`${lead.id}.forged`)).toBeNull();
    expect(profileIdFromToken(`someone-else.${t.split('.')[1]}`)).toBeNull();
    expect(profileIdFromToken('garbage')).toBeNull();
  });

  it('every sequence email carries the address and a working unsubscribe link', async () => {
    const lead = await seedLead();
    await runNurtureSequenceTick(repo, 10, true);
    const sent = (await repo.listEmailMessagesByProfile(lead.id)).find((m) => m.direction === 'outbound');
    expect(sent?.body_text).toContain('539 W. Commerce St Suite #1019, Dallas, TX 75208');
    expect(sent?.body_text).toContain('/api/unsubscribe?t=');
  });

  it('GET with a valid link stops the sequence; POST (one-click) does too', async () => {
    const lead = await seedLead();
    const url = `http://localhost/api/unsubscribe?t=${unsubscribeToken(lead.id)}`;
    const res = await GET(new Request(url));
    expect(res.status).toBe(200);
    expect((await repo.getLeadStateByProfile(lead.id))?.sequence_status).toBe('stopped');

    await repo.updateLeadState(lead.id, { sequence_status: 'active' });
    const post = await POST(new Request(url, { method: 'POST' }));
    expect(post.status).toBe(200);
    expect((await repo.getLeadStateByProfile(lead.id))?.sequence_status).toBe('stopped');
  });

  it('an invalid link changes nothing', async () => {
    const lead = await seedLead();
    const res = await GET(new Request(`http://localhost/api/unsubscribe?t=${lead.id}.forged`));
    expect(res.status).toBe(400);
    expect((await repo.getLeadStateByProfile(lead.id))?.sequence_status).toBe('active');
  });
});
