import { revokeCurrentSession } from '@/server/auth/session';
import { ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async () => {
  await revokeCurrentSession();
  return ok({ ok: true });
});
