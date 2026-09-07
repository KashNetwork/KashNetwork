import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { getEmailProvider } from '@/server/adapters';
import { requireAuth } from '@/server/auth/guard';
import { config } from '@/server/config';
import { getDb } from '@/server/db';
import { badRequest, ok, readJson, route } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** POST /api/auth/email-change — request an email change; confirm from new address. */
export const POST = route(async (req) => {
  const { profile } = await requireAuth();
  const parsed = z
    .object({ newEmail: z.string().trim().toLowerCase().email() })
    .safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body');
  const { newEmail } = parsed.data;
  if (newEmail === profile.email) throw badRequest('same_email');

  const verdict = await getEmailProvider().verifyEmail(newEmail);
  if (!verdict.valid) throw badRequest('invalid_email');
  const db = await getDb();
  if (await db.getProfileByEmail(newEmail)) throw badRequest('email_taken');

  const token = randomBytes(32).toString('base64url');
  await db.createEmailChange({
    profileId: profile.id,
    newEmail,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  const link = `${config.publicSiteUrl.replace(/\/$/, '')}/app/confirm-email?token=${token}`;
  await getEmailProvider().send({
    from: config.resend.fromSupport,
    to: newEmail,
    subject: 'Confirm your new email address',
    text: `Confirm your new Kash Network email: ${link}`,
    html: `<p>Confirm your new Kash Network email:</p><p><a href="${link}">${link}</a></p>`,
  });
  return ok({ ok: true, pendingEmail: newEmail });
});
