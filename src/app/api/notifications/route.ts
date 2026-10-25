import { getDb } from '@/server/db';
import { ok, route } from '@/server/http';
import { formatLiveEvents } from '@/server/services/live-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/notifications — social-proof feed built only from real events (joins, commissions). */
export const GET = route(async () => {
  const rows = await (await getDb()).listLiveEvents(8);
  return ok({ items: formatLiveEvents(rows) });
});
