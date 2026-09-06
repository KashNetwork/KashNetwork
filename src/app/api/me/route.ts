import { requireAuth } from '@/server/auth/guard';
import { ok, route } from '@/server/http';
import { presentMe } from '@/server/services/account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/me — current account state + visible tabs. */
export const GET = route(async () => {
  const { profile } = await requireAuth();
  return ok({ me: presentMe(profile) });
});
