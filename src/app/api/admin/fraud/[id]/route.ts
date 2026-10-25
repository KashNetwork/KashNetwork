import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/admin/fraud/:id — mark a flag as reviewed. */
export const POST = route(async (_req, ctx) => {
  const { profile: admin } = await requireAdmin();
  const { id } = await ctx.params;
  const db = await getDb();
  await db.resolveFraudFlag(id, admin.id);
  await db.createAudit({ adminId: admin.id, action: 'fraud.resolve', targetType: 'fraud_flag', targetId: id });
  return ok({ resolved: true });
});
