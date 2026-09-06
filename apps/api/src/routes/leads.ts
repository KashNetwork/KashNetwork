import { Router } from 'express';
import { z } from 'zod';
import { getEmailProvider } from '../adapters/index.js';
import { issueSession, REF_COOKIE } from '../auth/sessions.js';
import { getRepo } from '../db/index.js';
import { asyncHandler, badRequest, clientIp, conflict } from '../lib/http.js';
import { presentMe } from '../services/account.js';

const router = Router();

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(1).max(120).optional(),
  ref: z.string().trim().max(64).optional(),
});

/**
 * POST /api/leads — the video-gate email capture.
 * Verifies the email is real, creates (or re-uses) a passwordless free account,
 * and issues a long-lived lead session. The frontend resumes the video on 200.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid_body', 'A valid email is required.');
    const { email, fullName } = parsed.data;
    const repo = getRepo();

    const verdict = await getEmailProvider().verifyEmail(email);
    if (!verdict.valid) {
      throw badRequest('invalid_email', `That email looks ${verdict.reason ?? 'undeliverable'}.`);
    }

    const existing = await repo.getProfileByEmail(email);
    if (existing) {
      if (existing.account_type === 'paid' || existing.password_hash) {
        throw conflict('account_exists', 'You already have an account — please log in.');
      }
      await issueSession(res, existing.id, 'lead', {
        ip: clientIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      });
      res.json({ me: presentMe(existing), created: false });
      return;
    }

    // resolve tentative attribution from ?ref / kn_ref cookie
    const refCode =
      parsed.data.ref ?? (req.cookies?.[REF_COOKIE] as string | undefined) ?? undefined;
    let referredBy: string | null = null;
    if (refCode) {
      const aff = await repo.getProfileByAffiliateCode(refCode);
      if (aff && aff.is_affiliate && aff.account_type === 'paid') referredBy = aff.id;
    }

    const profile = await repo.createProfile({
      email,
      full_name: fullName ?? null,
      account_type: 'free',
      free_variant: 'lead',
      email_verified_at: new Date().toISOString(),
      referred_by_affiliate_id: referredBy,
      signup_ip: clientIp(req),
      signup_user_agent: req.headers['user-agent'] ?? null,
    });

    await issueSession(res, profile.id, 'lead', {
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    });
    res.status(201).json({ me: presentMe(profile), created: true });
  }),
);

export default router;
