import { DEFAULTS, MONEY, type PaymentEvent } from '@/shared';
import type { ProfileRow, Repo, SubscriptionRow } from '../db/index';
import { activateAffiliate, deactivateAffiliate } from './affiliate';
import { resolveAttribution } from './attribution';
import { markLeadConverted } from './email-sequence';
import { flagChargeback, flagSelfReferral } from './fraud';

const DAY = 86_400_000;
const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * DAY).toISOString();

async function ensureProfile(repo: Repo, email: string): Promise<ProfileRow> {
  const existing = await repo.getProfileByEmail(email);
  if (existing) return existing;
  // paid without going through the gate — create a bare account
  return repo.createProfile({
    email,
    account_type: 'free',
    free_variant: 'lead',
    email_verified_at: new Date().toISOString(),
  });
}

/**
 * The payment state machine. Idempotent: `payment_events` is deduped by the
 * caller, and each branch re-checks state before mutating so replays are safe.
 */
export async function processPaymentEvent(
  repo: Repo,
  event: PaymentEvent,
  paymentEventId: string,
): Promise<string> {
  switch (event.type) {
    case 'trial_started':
      return onTrialStarted(repo, event, paymentEventId);
    case 'subscription_activated':
    case 'rebill_succeeded':
      return onRebill(repo, event, paymentEventId);
    case 'rebill_failed':
      return onRebillFailed(repo, event);
    case 'refunded':
    case 'chargeback':
      return onReversal(repo, event);
    case 'cancel_requested':
      return onCancelRequested(repo, event);
    case 'subscription_cancelled':
      return onSubscriptionCancelled(repo, event);
    case 'reactivated':
      return onReactivated(repo, event);
    default:
      return `ignored:${event.type}`;
  }
}

async function onTrialStarted(repo: Repo, event: PaymentEvent, _peId: string): Promise<string> {
  const profile = await ensureProfile(repo, event.customerEmail);

  // subscription
  let sub = event.externalSubId
    ? await repo.getSubscriptionByExternalId(event.externalSubId)
    : await repo.getSubscriptionByProfile(profile.id);
  if (!sub) {
    sub = await repo.createSubscription({
      profile_id: profile.id,
      external_sub_id: event.externalSubId,
      external_product_id: null,
      state: 'trialing',
      price_cents: MONEY.trialPriceCents,
      trial_started_at: event.occurredAt,
      trial_ends_at: addDays(event.occurredAt, 7),
      current_period_end: addDays(event.occurredAt, 7),
    });
  }

  // attribution — webhook has no visitor cookie, so ref code + signup ref only
  if (!(await repo.getReferralByReferredProfile(profile.id))) {
    const attr = await resolveAttribution(repo, profile, { refCode: event.affiliateRef });
    if (attr.selfReferral) await flagSelfReferral(repo, profile, attr.affiliateId);
    await repo.createReferral({
      affiliateId: attr.affiliateId,
      referredProfileId: profile.id,
      status: 'trial',
      attributionSource: attr.source,
      attributionLocked: true,
    });
  }

  // become a paid user + affiliate
  if (profile.account_type !== 'paid') {
    await repo.updateProfile(profile.id, { account_type: 'paid' });
  }
  await activateAffiliate(repo, { ...profile, account_type: 'paid' });

  // purchase confirmed -> the free-lead nurture sequence stops immediately
  await markLeadConverted(repo, profile.id);

  // $0 commission on the trial — nothing to create
  return 'trial_started:paid+affiliate';
}

async function onRebill(repo: Repo, event: PaymentEvent, paymentEventId: string): Promise<string> {
  const profile = await repo.getProfileByEmail(event.customerEmail);
  if (!profile) return 'rebill:no_profile';

  let sub =
    (event.externalSubId && (await repo.getSubscriptionByExternalId(event.externalSubId))) ||
    (await repo.getSubscriptionByProfile(profile.id));
  if (!sub) {
    sub = await repo.createSubscription({
      profile_id: profile.id,
      external_sub_id: event.externalSubId,
      state: 'active',
      price_cents: MONEY.monthlyPriceCents,
    });
  }
  const nextPeriodEnd = addDays(event.occurredAt, 30);
  sub = await repo.updateSubscription(sub.id, {
    state: 'active',
    price_cents: MONEY.monthlyPriceCents,
    current_period_end: nextPeriodEnd,
  });

  // make sure they're still a paid affiliate (reactivation via rebill)
  if (profile.account_type !== 'paid') {
    await repo.updateProfile(profile.id, { account_type: 'paid' });
    await activateAffiliate(repo, { ...profile, account_type: 'paid' });
  }

  // recurring commission — $30 to whoever the referral points at (real affiliate
  // or admin, if the affiliate was cancelled and the downline was reassigned)
  const referral = await repo.getReferralByReferredProfile(profile.id);
  if (referral) {
    const existing = await repo.getCommissionForReferralEvent(referral.id, paymentEventId);
    if (!existing && MONEY.affiliateRecurringCents > 0) {
      await repo.createCommission({
        affiliateId: referral.affiliate_id,
        referralId: referral.id,
        subscriptionId: sub.id,
        paymentEventId,
        amountCents: MONEY.affiliateRecurringCents,
        kind: 'recurring',
        holdUntil: addDays(event.occurredAt, DEFAULTS.commissionHoldDays),
      });
    }
    if (referral.status !== 'active') await repo.updateReferral(referral.id, { status: 'active' });
  }
  return `rebill:commission_${referral ? 'created' : 'skipped'}`;
}

async function onRebillFailed(repo: Repo, event: PaymentEvent): Promise<string> {
  const sub = await subFor(repo, event);
  if (sub && sub.state !== 'cancelled') {
    await repo.updateSubscription(sub.id, { state: 'past_due' });
  }
  return 'rebill_failed:past_due';
}

async function onReversal(repo: Repo, event: PaymentEvent): Promise<string> {
  const profile = await repo.getProfileByEmail(event.customerEmail);
  // reverse commissions tied to the original transaction being refunded/charged back
  let reversed = 0;
  const originals = event.externalTxnId
    ? await repo.getPaymentEventsByTxn(event.externalTxnId)
    : [];
  for (const orig of originals) {
    if (orig.event_type === 'refunded' || orig.event_type === 'chargeback') continue;
    reversed += await repo.reverseCommissionsForPaymentEvent(
      orig.id,
      event.type === 'chargeback' ? 'chargeback' : 'refund',
    );
  }
  const referral = profile ? await repo.getReferralByReferredProfile(profile.id) : null;
  if (referral) await repo.updateReferral(referral.id, { status: 'refunded' });
  if (event.type === 'chargeback' && profile) {
    await flagChargeback(repo, profile, referral?.affiliate_id ?? null);
  }
  return `${event.type}:${reversed}_commissions_reversed`;
}

async function onCancelRequested(repo: Repo, event: PaymentEvent): Promise<string> {
  const sub = await subFor(repo, event);
  if (sub && sub.state !== 'cancelled') {
    await repo.updateSubscription(sub.id, { cancel_at_period_end: true, state: 'cancelling' });
  }
  return 'cancel_requested:pending_at_period_end';
}

async function onSubscriptionCancelled(repo: Repo, event: PaymentEvent): Promise<string> {
  const profile = await repo.getProfileByEmail(event.customerEmail);
  const sub = await subFor(repo, event);
  if (sub) {
    await repo.updateSubscription(sub.id, { state: 'cancelled', cancelled_at: event.occurredAt });
  }
  if (profile && profile.account_type === 'paid') {
    await deactivateAffiliate(repo, profile, 'affiliate_cancelled');
  }
  return 'subscription_cancelled:downgraded';
}

async function onReactivated(repo: Repo, event: PaymentEvent): Promise<string> {
  const profile = await repo.getProfileByEmail(event.customerEmail);
  const sub = await subFor(repo, event);
  if (sub) {
    await repo.updateSubscription(sub.id, {
      state: 'active',
      cancel_at_period_end: false,
      reactivated_at: event.occurredAt,
      current_period_end: addDays(event.occurredAt, 30),
    });
  }
  if (profile) {
    await repo.updateProfile(profile.id, { account_type: 'paid' });
    // same affiliate_code; prior referrals stay with admin (stats reset)
    await activateAffiliate(repo, { ...profile, account_type: 'paid' });
  }
  return 'reactivated:affiliate_restored';
}

async function subFor(repo: Repo, event: PaymentEvent): Promise<SubscriptionRow | null> {
  if (event.externalSubId) {
    const s = await repo.getSubscriptionByExternalId(event.externalSubId);
    if (s) return s;
  }
  const p = await repo.getProfileByEmail(event.customerEmail);
  return p ? repo.getSubscriptionByProfile(p.id) : null;
}
