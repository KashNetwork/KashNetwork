import { z } from 'zod';
import { getPaymentProvider } from '@/server/adapters';
import { requirePaid } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ApiError, badRequest, notFound, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/me/subscription  { action: "cancel" | "resume" }
 * Cancel = cancel-at-period-end (they keep access until current_period_end).
 * The actual downgrade to free happens from the Explodely IPN / cron at that date.
 */
export const POST = route(async (req) => {
  const { profile } = await requirePaid();
  const parsed = z.object({ action: z.enum(['cancel', 'resume']) }).safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');

  const db = await getDb();
  const sub = await db.getSubscriptionByProfile(profile.id);
  if (!sub) throw notFound('no subscription on file');

  if (parsed.data.action === 'cancel') {
    if (sub.external_sub_id) {
      try {
        await getPaymentProvider().cancelSubscription?.(sub.external_sub_id, true);
      } catch (e) {
        // never show "cancelled" while the provider would keep billing the card
        console.warn('[subscription] provider cancel failed', (e as Error).message);
        throw new ApiError(
          502,
          'provider_cancel_failed',
          'We could not cancel with the payment provider. Please try again in a few minutes, or email support@kash.network and we will cancel it for you.',
        );
      }
    }
    const updated = await db.updateSubscription(sub.id, {
      cancel_at_period_end: true,
      state: 'cancelling',
    });
    return ok({ subscription: pick(updated) });
  }

  // resume
  const updated = await db.updateSubscription(sub.id, {
    cancel_at_period_end: false,
    state: sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date() ? 'trialing' : 'active',
  });
  return ok({ subscription: pick(updated) });
});

/** GET /api/me/subscription — current subscription summary. */
export const GET = route(async () => {
  const { profile } = await requirePaid();
  const sub = await (await getDb()).getSubscriptionByProfile(profile.id);
  return ok({ subscription: sub ? pick(sub) : null });
});

function pick(s: Awaited<ReturnType<Awaited<ReturnType<typeof getDb>>['getSubscriptionByProfile']>>) {
  if (!s) return null;
  return {
    state: s.state,
    priceCents: s.price_cents,
    trialEndsAt: s.trial_ends_at,
    currentPeriodEnd: s.current_period_end,
    cancelAtPeriodEnd: s.cancel_at_period_end,
  };
}
