import { beforeEach, describe, expect, it } from 'vitest';
import type { PaymentEvent, PaymentEventType } from '@/shared';
import { hashPassword } from '@/server/auth/passwords';
import { setRepo } from '@/server/db';
import { InMemoryRepo } from '@/server/db/memory';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';

let repo: InMemoryRepo;
let n = 0;

function ev(type: PaymentEventType, email: string, txn?: string): PaymentEvent {
  const id = txn ?? `t_${++n}`;
  return {
    type,
    externalTxnId: id,
    externalSubId: `sub_${email}`,
    customerEmail: email,
    amountCents: type === 'trial_started' ? 100 : 4700,
    currency: 'USD',
    affiliateRef: null,
    occurredAt: new Date().toISOString(),
    raw: {},
    dedupeKey: `${id}:${type}`,
  };
}

beforeEach(async () => {
  repo = new InMemoryRepo();
  setRepo(repo);
  const a = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  await repo.updateProfile(a.id, { role: 'admin', is_affiliate: true, affiliate_code: 'admin', password_hash: await hashPassword('x') });
  await repo.createProfile({ email: 'buyer.one@gmail.com', account_type: 'free' });
});

describe('admin overview', () => {
  it('counts trial + renewal admin share, and drops a refunded payment', async () => {
    await ingestPaymentEvent(ev('trial_started', 'buyer.one@gmail.com'), true);
    await ingestPaymentEvent(ev('rebill_succeeded', 'buyer.one@gmail.com', 'renew1'), true);
    expect((await repo.adminOverview()).adminRevenueCents).toBe(100 + 1700);

    await ingestPaymentEvent(ev('refunded', 'buyer.one@gmail.com', 'renew1'), true);
    expect((await repo.adminOverview()).adminRevenueCents).toBe(100);
  });

  it('lists recent signups and payment events, newest first', async () => {
    await ingestPaymentEvent(ev('trial_started', 'buyer.one@gmail.com'), true);
    const { recentActivity } = await repo.adminOverview();
    expect(recentActivity.some((a) => a.kind === 'signup' && a.email === 'buyer.one@gmail.com')).toBe(true);
    expect(recentActivity.some((a) => a.kind === 'payment' && a.detail === 'trial_started')).toBe(true);
    const times = recentActivity.map((a) => a.at);
    expect([...times].sort().reverse()).toEqual(times);
  });
});
