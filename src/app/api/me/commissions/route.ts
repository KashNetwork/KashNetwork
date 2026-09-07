import { requirePaid } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { forbidden, ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/me/commissions — wallet / pending / this-month + own transactions. */
export const GET = route(async () => {
  const { profile } = await requirePaid();
  if (!profile.is_affiliate) throw forbidden('not_an_affiliate');
  const db = await getDb();

  const [stats, transactions] = await Promise.all([
    db.affiliateStats(profile.id),
    db.paymentsForEmail(profile.email),
  ]);

  return ok({
    walletCents: stats.availableCents,
    pendingCents: stats.pendingCents,
    thisMonthCents: stats.thisMonthCents,
    lifetimeCents: stats.totalCommissionsCents,
    cashouts: [], // Milestone 3
    transactions: transactions
      .filter((t) =>
        ['trial_started', 'subscription_activated', 'rebill_succeeded'].includes(t.event_type),
      )
      .map((t) => ({
        id: t.id,
        type: t.event_type === 'trial_started' ? 'Trial' : 'Monthly',
        amountCents: t.amount_cents,
        date: t.occurred_at,
      })),
  });
});
