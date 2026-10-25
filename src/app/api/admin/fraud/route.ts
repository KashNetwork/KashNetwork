import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/fraud?resolved=1 — safeguard flags (self-referral, duplicate accounts, chargebacks…). */
export const GET = route(async (req) => {
  await requireAdmin();
  const resolved = new URL(req.url).searchParams.get('resolved') === '1';
  const rows = await (await getDb()).listFraudFlags(resolved, 100);
  return ok({ rows });
});
