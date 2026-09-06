import { z } from 'zod';
import { requireAdmin } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/users?filter=&q=&page= */
export const GET = route(async (req) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const q = z
    .object({
      filter: z.enum(['all', 'free_leads', 'active_paid', 'cancelled']).catch('all'),
      q: z.string().trim().max(120).optional(),
      page: z.coerce.number().int().min(1).catch(1),
    })
    .parse({ filter: sp.get('filter'), q: sp.get('q') ?? undefined, page: sp.get('page') });

  const { rows, total } = await (await getDb()).adminListUsers({
    filter: q.filter,
    q: q.q,
    page: q.page,
    pageSize: 25,
  });
  return ok({ rows, total, page: q.page, pageSize: 25 });
});
