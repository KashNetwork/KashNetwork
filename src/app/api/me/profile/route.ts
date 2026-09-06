import { z } from 'zod';
import { requireAuth } from '@/server/auth/guard';
import { getDb } from '@/server/db';
import { badRequest, ok, readJson, route } from '@/server/http';
import { presentMe } from '@/server/services/account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** PATCH /api/me/profile — update the name (email goes through /auth/email-change). */
export const PATCH = route(async (req) => {
  const { profile } = await requireAuth();
  const parsed = z
    .object({ fullName: z.string().trim().min(1).max(120) })
    .safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');
  const updated = await (await getDb()).updateProfile(profile.id, {
    full_name: parsed.data.fullName,
  });
  return ok({ me: presentMe(updated) });
});
