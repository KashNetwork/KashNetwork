import { z } from 'zod';
import { requireAuth } from '@/server/auth/guard';
import { hashPassword, passwordStrengthError, verifyPassword } from '@/server/auth/passwords';
import { issueSession } from '@/server/auth/session';
import { getDb } from '@/server/db';
import { badRequest, clientIp, ok, readJson, route, userAgent } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/auth/password — set or change password (authenticated). */
export const POST = route(async (req) => {
  const { profile } = await requireAuth();
  const parsed = z
    .object({ currentPassword: z.string().optional(), newPassword: z.string() })
    .safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');
  const strength = passwordStrengthError(parsed.data.newPassword);
  if (strength) throw badRequest('weak_password', strength);

  if (profile.password_hash) {
    if (!parsed.data.currentPassword) throw badRequest('current_password_required');
    const good = await verifyPassword(parsed.data.currentPassword, profile.password_hash);
    if (!good) throw badRequest('current_password_wrong', 'Current password is incorrect.');
  }

  const db = await getDb();
  await db.updateProfile(profile.id, { password_hash: await hashPassword(parsed.data.newPassword) });
  await db.revokeAllSessionsForProfile(profile.id);
  await issueSession(profile.id, 'user', { ip: clientIp(req), userAgent: userAgent(req) });
  return ok({ ok: true });
});
