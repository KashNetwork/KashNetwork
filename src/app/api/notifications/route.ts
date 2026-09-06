import { z } from 'zod';
import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/notifications?location=landing|sales — shuffled social-proof feed. */
export const GET = route(async (req) => {
  const location = z
    .enum(['landing', 'sales'])
    .catch('landing')
    .parse(new URL(req.url).searchParams.get('location'));
  const rows = await (await getDb()).listNotifications(location);
  const pool = rows.flatMap((r) => Array<(typeof rows)[number]>(Math.max(1, r.weight)).fill(r));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const seen = new Set<string>();
  const items = pool
    .filter((r) => (seen.has(r.id) ? false : seen.add(r.id)))
    .slice(0, 8)
    .map((r) => ({ id: r.id, label: r.member_label, message: r.message, time: r.relative_time_text }));
  return ok({ items });
});
