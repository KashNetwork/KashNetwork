import { createHash, randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { getEmailProvider } from '../adapters/index.js';
import { requireAuth } from '../auth/middleware.js';
import { hashPassword, passwordStrengthError, verifyPassword } from '../auth/passwords.js';
import {
  clearSessionCookie,
  issueSession,
  revokeSession,
  SESSION_COOKIE,
} from '../auth/sessions.js';
import { config } from '../config.js';
import { getRepo } from '../db/index.js';
import { asyncHandler, badRequest, clientIp, unauthorized } from '../lib/http.js';
import { presentMe } from '../services/account.js';

const router = Router();
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** POST /api/auth/login — paid users only (leads have no password). */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) })
      .safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid_body');
    const profile = await getRepo().getProfileByEmail(parsed.data.email);
    if (!profile || !profile.password_hash) throw unauthorized('Invalid email or password.');
    const ok = await verifyPassword(parsed.data.password, profile.password_hash);
    if (!ok) throw unauthorized('Invalid email or password.');
    await issueSession(res, profile.id, 'user', {
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    });
    res.json({ me: presentMe(profile) });
  }),
);

/** POST /api/auth/logout */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    await revokeSession(req.cookies?.[SESSION_COOKIE] as string | undefined);
    clearSessionCookie(res);
    res.json({ ok: true });
  }),
);

/** POST /api/auth/password — set or change password (authenticated). */
router.post(
  '/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({ currentPassword: z.string().optional(), newPassword: z.string() })
      .safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid_body');
    const strength = passwordStrengthError(parsed.data.newPassword);
    if (strength) throw badRequest('weak_password', strength);

    const profile = req.auth!.profile;
    if (profile.password_hash) {
      if (!parsed.data.currentPassword) throw badRequest('current_password_required');
      const ok = await verifyPassword(parsed.data.currentPassword, profile.password_hash);
      if (!ok) throw badRequest('current_password_wrong', 'Current password is incorrect.');
    }
    await getRepo().updateProfile(profile.id, {
      password_hash: await hashPassword(parsed.data.newPassword),
    });
    // keep the current session; drop the others
    await getRepo().revokeAllSessionsForProfile(profile.id);
    await issueSession(res, profile.id, 'user', {
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    });
    res.json({ ok: true });
  }),
);

/** POST /api/auth/email-change — request an email change; confirm from new address. */
router.post(
  '/email-change',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({ newEmail: z.string().trim().toLowerCase().email() })
      .safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid_body');
    const { newEmail } = parsed.data;
    const profile = req.auth!.profile;
    if (newEmail === profile.email) throw badRequest('same_email');

    const verdict = await getEmailProvider().verifyEmail(newEmail);
    if (!verdict.valid) throw badRequest('invalid_email');
    if (await getRepo().getProfileByEmail(newEmail)) throw badRequest('email_taken');

    const token = randomBytes(32).toString('base64url');
    await getRepo().createEmailChange({
      profileId: profile.id,
      newEmail,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    const link = `${config.publicSiteUrl.replace(/\/$/, '')}/app/confirm-email?token=${token}`;
    await getEmailProvider().send({
      from: 'support@kash.network',
      to: newEmail,
      subject: 'Confirm your new email address',
      text: `Confirm your new Kash Network email: ${link}`,
      html: `<p>Confirm your new Kash Network email:</p><p><a href="${link}">${link}</a></p>`,
    });
    res.json({ ok: true, pendingEmail: newEmail });
  }),
);

/** GET /api/auth/email-change/confirm?token= */
router.get(
  '/email-change/confirm',
  asyncHandler(async (req, res) => {
    const token = z.string().min(10).safeParse(req.query.token);
    if (!token.success) throw badRequest('invalid_token');
    const row = await getRepo().getEmailChangeByTokenHash(sha256(token.data));
    if (!row || row.confirmed_at || new Date(row.expires_at).getTime() < Date.now())
      throw badRequest('invalid_token', 'This confirmation link is invalid or has expired.');
    if (await getRepo().getProfileByEmail(row.new_email)) throw badRequest('email_taken');
    await getRepo().updateProfile(row.profile_id, { email: row.new_email });
    await getRepo().markEmailChangeConfirmed(row.id);
    res.json({ ok: true, email: row.new_email });
  }),
);

export default router;
