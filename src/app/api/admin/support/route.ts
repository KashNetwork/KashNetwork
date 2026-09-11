import { z } from 'zod';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/support?page= — every paid user's support ticket, newest first. */
export const GET = route(async (req) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const q = z
    .object({ page: z.coerce.number().int().min(1).catch(1) })
    .parse({ page: sp.get('page') });

  const { rows, total } = await (await getDb()).listSupportTickets({ page: q.page, pageSize: 25 });
  return ok({ rows, total, page: q.page, pageSize: 25 });
});
