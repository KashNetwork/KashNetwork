import { getEmailProvider } from '../adapters';
import { config } from '../config';
import type { Repo } from '../db/repo';
import { magicLinkUrl, WELCOME_TTL_MS } from './magic-link';

/** Sent once when a purchase turns an account paid. */
export async function sendWelcomeEmail(repo: Repo, profileId: string, email: string) {
  const link = magicLinkUrl(profileId, WELCOME_TTL_MS);
  const subject = 'Welcome to Kash Network — your account is ready';
  const text = `Hi,\n\nThanks for joining Kash Network. Your account is active.\n\nSign in here (the link works for 3 days):\n${link}\n\nOnce you're in, open Profile and set a password so you can log in any time. If you ever need a new sign-in link, use "Email me a sign-in link" on the login page.\n\nQuestions? Just reply to this email or write to support@kash.network.\n\nKash Support`;
  const html = `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#0f172a;"><p>Hi,</p><p>Thanks for joining Kash Network. Your account is active.</p><p><a href="${link}">Sign in to Kash Network</a> (the link works for 3 days)</p><p>Once you're in, open <b>Profile</b> and set a password so you can log in any time. If you ever need a new sign-in link, use "Email me a sign-in link" on the login page.</p><p>Questions? Just reply to this email or write to support@kash.network.</p><p>Kash Support</p></div>`;
  const sent = await getEmailProvider().send({
    from: config.resend.fromSupport,
    to: email,
    subject,
    text,
    html,
    replyTo: config.resend.replySupport,
    tags: { kind: 'welcome' },
  });
  await repo.createEmailMessage({
    profileId,
    direction: 'outbound',
    fromAddr: config.resend.fromSupport,
    toAddr: email,
    subject,
    bodyText: 'Welcome email with sign-in link sent.',
    bodyHtml: null,
    providerMessageId: sent.providerMessageId,
  });
}
