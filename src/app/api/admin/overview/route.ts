import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';

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
    adminRevenueCents: o.adminRevenueCents, // $1/trial + $17/rebill from payment events
    pendingPayoutsCents: o.payableCents, // affiliate commissions available / requested
  });
});
