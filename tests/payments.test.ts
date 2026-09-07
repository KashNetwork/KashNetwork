import { beforeEach, describe, expect, it } from 'vitest';
import type { PaymentEvent, PaymentEventType } from '@/shared';
import { hashPassword } from '@/server/auth/passwords';
import { setRepo } from '@/server/db';
import { InMemoryRepo } from '@/server/db/memory';
import { ingestPaymentEvent } from '@/server/services/webhook-ingest';

let repo: InMemoryRepo;

async function seedAdmin() {
  const a = await repo.createProfile({ email: 'admin@kash.network', account_type: 'paid', role: 'admin' });
  await repo.updateProfile(a.id, {
    role: 'admin',
    is_affiliate: true,
    affiliate_code: 'admin',
    password_hash: await hashPassword('x'),
  });
  return a;
}

async function makeAffiliate(email: string, code: string) {
  const p = await repo.createProfile({ email, account_type: 'paid' });
  return repo.updateProfile(p.id, { is_affiliate: true, affiliate_code: code });
}

let txnCounter = 0;
function ev(
  type: PaymentEventType,
  email: string,
  extra: Partial<PaymentEvent> = {},
): PaymentEvent {
  const txn = extra.externalTxnId ?? `txn_${++txnCounter}`;
  return {
    type,
    externalTxnId: txn,
    externalSubId: extra.externalSubId ?? `sub_${email}`,
    customerEmail: email,
    amountCents: extra.amountCents ?? (type === 'trial_started' ? 100 : 4700),
    currency: 'USD',
    affiliateRef: extra.affiliateRef ?? null,
    occurredAt: extra.occurredAt ?? new Date().toISOString(),
    raw: {},
    dedupeKey: `${txn}:${type}`,
  };
}

async function run(event: PaymentEvent) {
  return ingestPaymentEvent(event, true);
}

beforeEach(async () => {
  repo = new InMemoryRepo();
  setRepo(repo);
  txnCounter = 0;
  await seedAdmin();
});

describe('trial purchase', () => {
  it('turns a lead into a paid affiliate with a code + links + referral', async () => {
    await repo.createProfile({ email: 'john@gmail.com', account_type: 'free', free_variant: 'lead' });
    await run(ev('trial_started', 'john@gmail.com'));

    const john = await repo.getProfileByEmail('john@gmail.com');
    expect(john?.account_type).toBe('paid');
    expect(john?.is_affiliate).toBe(true);
    expect(john?.affiliate_code).toMatch(/^[A-Z0-9]{8}$/);

    const sub = await repo.getSubscriptionByProfile(john!.id);
    expect(sub?.state).toBe('trialing');
    expect(sub?.price_cents).toBe(100);

    const ref = await repo.getReferralByReferredProfile(john!.id);
    expect(ref).toBeTruthy();
    // no affiliate -> attributed to admin
    const admin = await repo.getProfileByEmail('admin@kash.network');
    expect(ref?.affiliate_id).toBe(admin!.id);

    expect(repo.referralLinks.filter((l) => l.affiliate_id === john!.id)).toHaveLength(3);
  });

  it('attributes to the affiliate whose ref code came through', async () => {
    const aff = await makeAffiliate('aff@gmail.com', 'AFF123');
    await run(ev('trial_started', 'sarah@gmail.com', { affiliateRef: 'AFF123' }));
    const sarah = await repo.getProfileByEmail('sarah@gmail.com');
    const ref = await repo.getReferralByReferredProfile(sarah!.id);
    expect(ref?.affiliate_id).toBe(aff.id);
    expect(ref?.attribution_source).toBe('ref_code');
  });

  it('drops a self-referral to admin and flags it', async () => {
    const aff = await makeAffiliate('self@gmail.com', 'SELF1');
    await run(ev('trial_started', 'self@gmail.com', { affiliateRef: 'SELF1' }));
    const ref = await repo.getReferralByReferredProfile(aff.id);
    const admin = await repo.getProfileByEmail('admin@kash.network');
    expect(ref?.affiliate_id).toBe(admin!.id);
    expect(repo.fraudFlags.some((f) => f.type === 'self_referral')).toBe(true);
  });

  it('is idempotent', async () => {
    await repo.createProfile({ email: 'dup@gmail.com', account_type: 'free' });
    const e = ev('trial_started', 'dup@gmail.com');
    await run(e);
    await run(e);
    expect([...repo.subscriptions.values()].filter((s) => s.profile_id)).toHaveLength(1);
  });
});

describe('recurring commission', () => {
  it('pays the affiliate $30 on a rebill, pending with a 30-day hold', async () => {
    const aff = await makeAffiliate('a2@gmail.com', 'A2');
    await run(ev('trial_started', 'buyer@gmail.com', { affiliateRef: 'A2', externalSubId: 'S1' }));
    await run(ev('rebill_succeeded', 'buyer@gmail.com', { externalSubId: 'S1' }));

    const comms = await repo.listCommissionsByAffiliate(aff.id);
    expect(comms).toHaveLength(1);
    expect(comms[0]!.amount_cents).toBe(3000);
    expect(comms[0]!.status).toBe('pending');
    expect(new Date(comms[0]!.hold_until).getTime()).toBeGreaterThan(Date.now() + 25 * 86400_000);

    const sub = await repo.getSubscriptionByExternalId('S1');
    expect(sub?.state).toBe('active');
    expect(sub?.price_cents).toBe(4700);
  });

  it('does not double-pay on a replayed rebill', async () => {
    const aff = await makeAffiliate('a3@gmail.com', 'A3');
    await run(ev('trial_started', 'b3@gmail.com', { affiliateRef: 'A3', externalSubId: 'S3' }));
    const rebill = ev('rebill_succeeded', 'b3@gmail.com', { externalSubId: 'S3', externalTxnId: 'RB3' });
    await run(rebill);
    await run(rebill);
    expect(await repo.listCommissionsByAffiliate(aff.id)).toHaveLength(1);
  });

  it('reverses the commission on a refund of that rebill', async () => {
    const aff = await makeAffiliate('a4@gmail.com', 'A4');
    await run(ev('trial_started', 'b4@gmail.com', { affiliateRef: 'A4', externalSubId: 'S4' }));
    await run(ev('rebill_succeeded', 'b4@gmail.com', { externalSubId: 'S4', externalTxnId: 'RB4' }));
    await run(ev('refunded', 'b4@gmail.com', { externalSubId: 'S4', externalTxnId: 'RB4' }));

    const comms = await repo.listCommissionsByAffiliate(aff.id);
    expect(comms[0]!.status).toBe('reversed');
    expect(comms[0]!.reversal_reason).toBe('refund');
  });

  it('promotes pending commissions past their hold to available', async () => {
    const aff = await makeAffiliate('a5@gmail.com', 'A5');
    await run(ev('trial_started', 'b5@gmail.com', { affiliateRef: 'A5', externalSubId: 'S5' }));
    // rebill dated 40 days ago -> hold already elapsed
    const past = new Date(Date.now() - 40 * 86400_000).toISOString();
    await run(ev('rebill_succeeded', 'b5@gmail.com', { externalSubId: 'S5', occurredAt: past }));

    const promoted = await repo.promoteEligibleCommissions(new Date().toISOString());
    expect(promoted).toBe(1);
    const comms = await repo.listCommissionsByAffiliate(aff.id);
    expect(comms[0]!.status).toBe('available');

    const stats = await repo.affiliateStats(aff.id);
    expect(stats.availableCents).toBe(3000);
    expect(stats.pendingCents).toBe(0);
  });
});

describe('cancellation & reactivation', () => {
  it('cancel_requested marks the subscription, cancelled downgrades + reassigns', async () => {
    const aff = await makeAffiliate('c1@gmail.com', 'C1'); // aff who refers
    await run(ev('trial_started', 'ref1@gmail.com', { affiliateRef: 'C1', externalSubId: 'RS1' }));
    await run(ev('rebill_succeeded', 'ref1@gmail.com', { externalSubId: 'RS1' }));

    // now the affiliate themselves has a subscription and cancels
    await run(ev('trial_started', 'c1@gmail.com', { externalSubId: 'CS1' }));
    await run(ev('cancel_requested', 'c1@gmail.com', { externalSubId: 'CS1' }));
    let sub = await repo.getSubscriptionByExternalId('CS1');
    expect(sub?.cancel_at_period_end).toBe(true);
    expect(sub?.state).toBe('cancelling');

    await run(ev('subscription_cancelled', 'c1@gmail.com', { externalSubId: 'CS1' }));
    const affAfter = await repo.getProfileByEmail('c1@gmail.com');
    expect(affAfter?.account_type).toBe('free');
    expect(affAfter?.free_variant).toBe('downgraded');
    expect(affAfter?.is_affiliate).toBe(false);

    // their downline referral moved to admin, their pending commission forfeited
    const admin = await repo.getProfileByEmail('admin@kash.network');
    const movedRef = await repo.getReferralByReferredProfile(
      (await repo.getProfileByEmail('ref1@gmail.com'))!.id,
    );
    expect(movedRef?.affiliate_id).toBe(admin!.id);
    const comms = await repo.listCommissionsByAffiliate(aff.id);
    expect(comms.every((c) => c.status === 'reversed')).toBe(true);
  });

  it('reactivation restores affiliate status with the same code', async () => {
    await run(ev('trial_started', 'back@gmail.com', { externalSubId: 'BK1' }));
    const before = await repo.getProfileByEmail('back@gmail.com');
    const code = before!.affiliate_code;

    await run(ev('subscription_cancelled', 'back@gmail.com', { externalSubId: 'BK1' }));
    expect((await repo.getProfileByEmail('back@gmail.com'))?.is_affiliate).toBe(false);

    await run(ev('reactivated', 'back@gmail.com', { externalSubId: 'BK1' }));
    const after = await repo.getProfileByEmail('back@gmail.com');
    expect(after?.account_type).toBe('paid');
    expect(after?.is_affiliate).toBe(true);
    expect(after?.affiliate_code).toBe(code);
  });
});
