import { beforeEach, describe, expect, it } from 'vitest';
import { cookieJar } from './setup';
import { InMemoryRepo } from '@/server/db/memory';
import { setRepo } from '@/server/db';
import { leadAppLink, leadToken, profileIdFromLeadToken, LEAD_LINK_TTL_MS } from '@/server/services/magic-link';
import { GET as leadGET } from '../src/app/api/auth/lead/route';

let repo: InMemoryRepo;
beforeEach(() => {
  repo = new InMemoryRepo();
  setRepo(repo);
  cookieJar.clear();
});

const open = (url: string) => leadGET(new Request(url));

describe('the link inside the follow-up emails', () => {
  it('lasts the whole sequence, is bound to the member, and cannot be forged', async () => {
    const p = await repo.createProfile({ email: 'lead@gmail.com', account_type: 'free' });
    expect(profileIdFromLeadToken(leadToken(p.id))).toBe(p.id);
    expect(profileIdFromLeadToken(leadToken(p.id, Date.now() - LEAD_LINK_TTL_MS - 1000))).toBeNull();
    const [id, exp] = leadToken(p.id).split('.');
    expect(profileIdFromLeadToken(`${id}.${Number(exp) + 99999}.bogus`)).toBeNull();
    expect(profileIdFromLeadToken('x')).toBeNull();
  });

  it("signs a free member in and opens their free account with the affiliate's code", async () => {
    const p = await repo.createProfile({ email: 'lead@gmail.com', account_type: 'free' });
    const link = leadAppLink(p.id, 'AFF777');
    const res = await open(link);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(`${new URL(link).origin}/app?ref=AFF777`);
    expect(cookieJar.has('kn_session')).toBe(true);
  });

  it('never signs in a member who has since paid', async () => {
    const p = await repo.createProfile({ email: 'buyer@gmail.com', account_type: 'paid' });
    const link = leadAppLink(p.id, 'AFF777');
    const res = await open(link);
    expect(res.headers.get('location')).toBe(`${new URL(link).origin}/login`);
    expect(cookieJar.has('kn_session')).toBe(false);
  });

  it('sends an expired or forged link to the public Sales page with the same affiliate', async () => {
    const res = await open('http://localhost/api/auth/lead?t=bogus&ref=AFF777');
    expect(res.headers.get('location')).toBe('http://localhost/activate?ref=AFF777');
    expect(cookieJar.has('kn_session')).toBe(false);
  });

  it('ignores a malicious ref value', async () => {
    const p = await repo.createProfile({ email: 'lead@gmail.com', account_type: 'free' });
    const res = await open(`http://localhost/api/auth/lead?t=${leadToken(p.id)}&ref=%3Cscript%3E`);
    expect(res.headers.get('location')).toBe('http://localhost/app');
  });
});
