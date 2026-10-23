import { z } from 'zod';
import { FREE_NURTURE_SEQUENCE } from '@/content/email-sequence';
import { getEmailProvider } from '@/server/adapters';
import { getDb } from '@/server/db';
import { badRequest, clientIp, conflict, ok, readJson, route, userAgent } from '@/server/http';
import { getCookie, issueSession, REF_COOKIE } from '@/server/auth/session';
import { presentMe } from '@/server/services/account';
import { resolveAttribution } from '@/server/services/attribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(1).max(120).optional(),
  ref: z.string().trim().max(64).optional(),
});

const INVALID_EMAIL_MESSAGE: Record<string, string> = {
  syntax: "That doesn't look like a valid email address.",
  disposable: 'Please use a permanent email address, not a temporary/disposable one.',
  role: 'Please use a personal email address rather than a shared inbox like admin@ or support@.',
  placeholder: 'That looks like a placeholder address. Please enter your real email so we can reach you.',
  no_mx: "We couldn't find a mail server for that email's domain — please double-check it.",
  undeliverable: "That email address looks undeliverable — please double-check it.",
};

/**
 * POST /api/leads — the video-gate email capture. Verifies the email, creates
 * (or re-uses) a passwordless free account, issues a long-lived lead session.
 */
export const POST = route(async (req) => {
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body', 'A valid email is required.');
  const { email, fullName } = parsed.data;
  const db = await getDb();

  // Check for an existing account BEFORE running (paid) verification — a
  // returning lead or an existing customer re-entering their email doesn't
  // need re-verifying (it was already verified the first time, or they
  // already own the address), so this skips spending a Kickbox credit on
  // every repeat visit.
  const existing = await db.getProfileByEmail(email);
  if (existing) {
    if (existing.account_type === 'paid' || existing.password_hash) {
      throw conflict('account_exists', 'You already have an account — please log in.');
    }
    await issueSession(existing.id, 'lead', { ip: clientIp(req), userAgent: userAgent(req) });
    return ok({ me: presentMe(existing), created: false });
  }

  const verdict = await getEmailProvider().verifyEmail(email);
  if (!verdict.valid) {
    throw badRequest(
      'invalid_email',
      INVALID_EMAIL_MESSAGE[verdict.reason ?? 'undeliverable'] ?? INVALID_EMAIL_MESSAGE.undeliverable!,
    );
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

  // Kick off the 30-day nurture sequence. Whoever gets credit for this lead
  // (their ref code, or admin if none) is whose link goes in these emails —
  // same resolution the payment side uses, so it's consistent if they later buy.
  // Never let this block account creation itself — the funnel's core job
  // (create the free account, log them in) must succeed even if attribution
  // resolution has a bad day (e.g. no admin profile seeded yet).
  try {
    const attribution = await resolveAttribution(db, profile, { refCode });
    await db.createLeadState({
      profileId: profile.id,
      sequence: 'free_nurture',
      emailAffiliateId: attribution.affiliateId,
      nextSendAt: new Date(Date.now() + FREE_NURTURE_SEQUENCE[0]!.afterHours * 3_600_000).toISOString(),
    });
  } catch (e) {
    console.warn('[leads] could not start nurture sequence for', profile.id, (e as Error).message);
  }

  await issueSession(profile.id, 'lead', { ip: clientIp(req), userAgent: userAgent(req) });
  return ok({ me: presentMe(profile), created: true }, 201);
});
