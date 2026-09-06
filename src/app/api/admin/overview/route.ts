import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';
import { MONEY } from '@/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/overview — metric cards for the admin dashboard. */
export const GET = route(async () => {
  await requireAdmin();
  const o = await (await getDb()).adminOverview();
  return ok({
    activePaidMembers: o.activePaid,
    freeLeads: o.freeLeads,
    cancelledMembers: o.cancelled,
    totalProfiles: o.totalProfiles,
    // revenue/payouts are M2/M3 — placeholder so the UI renders
    adminRevenueCents: o.activePaid * MONEY.adminRecurringCents,
    pendingPayoutsCents: 0,
  });
});
