import { z } from 'zod';
import { getEmailProvider } from '@/server/adapters';
import { getDb } from '@/server/db';
import { badRequest, clientIp, conflict, ok, readJson, route, userAgent } from '@/server/http';
import { getCookie, issueSession, REF_COOKIE } from '@/server/auth/session';
import { presentMe } from '@/server/services/account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(1).max(120).optional(),
  ref: z.string().trim().max(64).optional(),
});

/**
 * POST /api/leads — the video-gate email capture. Verifies the email, creates
 * (or re-uses) a passwordless free account, issues a long-lived lead session.
 */
export const POST = route(async (req) => {
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body', 'A valid email is required.');
  const { email, fullName } = parsed.data;
  const db = await getDb();

  const verdict = await getEmailProvider().verifyEmail(email);
  if (!verdict.valid) {
    throw badRequest('invalid_email', `That email looks ${verdict.reason ?? 'undeliverable'}.`);
  }

  const existing = await db.getProfileByEmail(email);
  if (existing) {
    if (existing.account_type === 'paid' || existing.password_hash) {
      throw conflict('account_exists', 'You already have an account — please log in.');
    }
    await issueSession(existing.id, 'lead', { ip: clientIp(req), userAgent: userAgent(req) });
    return ok({ me: presentMe(existing), created: false });
  }

  const refCode = parsed.data.ref ?? (await getCookie(REF_COOKIE)) ?? undefined;
  let referredBy: string | null = null;
  if (refCode) {
    const aff = await db.getProfileByAffiliateCode(refCode);
    if (aff && aff.is_affiliate && aff.account_type === 'paid') referredBy = aff.id;
  }

  const profile = await db.createProfile({
    email,
    full_name: fullName ?? null,
    account_type: 'free',
    free_variant: 'lead',
    email_verified_at: new Date().toISOString(),
    referred_by_affiliate_id: referredBy,
    signup_ip: clientIp(req),
    signup_user_agent: userAgent(req),
  });

  await issueSession(profile.id, 'lead', { ip: clientIp(req), userAgent: userAgent(req) });
  return ok({ me: presentMe(profile), created: true }, 201);
});
