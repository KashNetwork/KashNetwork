import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '@/server/db';
import { badRequest, ok, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** GET /api/auth/email-change/confirm?token= */
export const GET = route(async (req) => {
  const token = z.string().min(10).safeParse(new URL(req.url).searchParams.get('token'));
  if (!token.success) throw badRequest('invalid_token');
  const db = await getDb();
  const row = await db.getEmailChangeByTokenHash(sha256(token.data));
  if (!row || row.confirmed_at || new Date(row.expires_at).getTime() < Date.now()) {
    throw badRequest('invalid_token', 'This confirmation link is invalid or has expired.');
  }
  if (await db.getProfileByEmail(row.new_email)) throw badRequest('email_taken');
  await db.updateProfile(row.profile_id, { email: row.new_email });
  await db.markEmailChangeConfirmed(row.id);
  return ok({ ok: true, email: row.new_email });
});
