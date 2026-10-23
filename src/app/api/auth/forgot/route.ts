import { z } from 'zod';
import { getEmailProvider } from '@/server/adapters';
import { config } from '@/server/config';
import { getDb } from '@/server/db';
import { badRequest, ok, readJson, route } from '@/server/http';
import { magicLinkUrl, SIGNIN_TTL_MS } from '@/server/services/magic-link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUBJECT = 'Your Kash Network sign-in link';

/**
 * POST /api/auth/forgot { email } — emails a 30-minute sign-in link to paid
 * members. Always answers the same way so it can't be used to find out who has
 * an account, and sends at most one email a minute per person.
 */
export const POST = route(async (req) => {
  const parsed = z.object({ email: z.string().trim().toLowerCase().email() }).safeParse(await readJson(req));
  if (!parsed.success) throw badRequest('invalid_body', 'Enter a valid email.');

  const db = await getDb();
  const profile = await db.getProfileByEmail(parsed.data.email);
  if (profile && profile.account_type === 'paid') {
    const recent = (await db.listEmailMessagesByProfile(profile.id, 5)).find(
      (m) => m.subject === SUBJECT && Date.now() - new Date(m.created_at).getTime() < 60_000,
    );
    if (!recent) {
      const link = magicLinkUrl(profile.id, SIGNIN_TTL_MS);
      const text = `Hi,\n\nUse this link to sign in to Kash Network. It works for 30 minutes:\n${link}\n\nOnce you're in, open Profile and set a password so you can log in any time.\n\nIf you didn't ask for this, you can ignore this email.\n\nKash Support`;
      try {
        const sent = await getEmailProvider().send({
          from: config.resend.fromSupport,
          to: profile.email,
          subject: SUBJECT,
          text,
          html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#0f172a;"><p>Hi,</p><p>Use this link to sign in to Kash Network. It works for 30 minutes:</p><p><a href="${link}">Sign in to Kash Network</a></p><p>Once you're in, open Profile and set a password so you can log in any time.</p><p>If you didn't ask for this, you can ignore this email.</p><p>Kash Support</p></div>`,
          replyTo: config.resend.replySupport,
          tags: { kind: 'signin_link' },
        });
        await db.createEmailMessage({
          profileId: profile.id,
          direction: 'outbound',
          fromAddr: config.resend.fromSupport,
          toAddr: profile.email,
          subject: SUBJECT,
          bodyText: 'Sign-in link sent.',
          bodyHtml: null,
          providerMessageId: sent.providerMessageId,
        });
      } catch (e) {
        console.warn('[forgot] could not send sign-in link:', (e as Error).message);
      }
    }
  }
  return ok({ ok: true });
});
