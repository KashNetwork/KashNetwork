import { z } from 'zod';
import { verifyPassword } from '@/server/auth/passwords';
import { issueSession } from '@/server/auth/session';
import { getDb } from '@/server/db';
import { badRequest, clientIp, ok, readJson, route, unauthorized, userAgent } from '@/server/http';
import { presentMe } from '@/server/services/account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/auth/login — paid users only (leads have no password). */
export const POST = route(async (req) => {
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) })
    .safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');
  const profile = await (await getDb()).getProfileByEmail(parsed.data.email);
  if (!profile || !profile.password_hash) throw unauthorized('Invalid email or password.');
  const good = await verifyPassword(parsed.data.password, profile.password_hash);
  if (!good) throw unauthorized('Invalid email or password.');
  await issueSession(profile.id, 'user', { ip: clientIp(req), userAgent: userAgent(req) });
  return ok({ me: presentMe(profile) });
});
