import { resolveMx } from 'node:dns/promises';
import { Resend } from 'resend';
import type { EmailProvider } from '@/shared';
import { config } from '../config';

// Common disposable / throwaway domains — a cheap first filter at the video gate.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'trashmail.com',
  'yopmail.com', 'temp-mail.org', 'sharklasers.com', 'getnada.com', 'dispostable.com',
  'maildrop.cc', 'fakeinbox.com', 'tempmail.com', 'throwawaymail.com', 'mailnesia.com',
  'guerrillamailblock.com', 'spam4.me', 'trbvm.com', 'byom.de',
]);
const ROLE_LOCALPARTS = new Set([
  'admin', 'administrator', 'postmaster', 'hostmaster', 'webmaster', 'abuse',
  'noreply', 'no-reply', 'donotreply',
]);

const mxCache = new Map<string, boolean>();

/**
 * Resend-backed EmailProvider.
 *
 * `send` goes through Resend. `verifyEmail` is a syntax + disposable + live-MX
 * check (Resend has no address-validation API) — enough to keep obviously fake
 * addresses out at the gate without a paid verification service. Swap in
 * ZeroBounce/Kickbox later by pointing EMAIL_VERIFY_PROVIDER at it.
 */
export class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(config.resend.apiKey);
  }

  async send(msg: Parameters<EmailProvider['send']>[0]) {
    const { data, error } = await this.client.emails.send({
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
      tags: msg.tags
        ? Object.entries(msg.tags).map(([name, value]) => ({ name, value: String(value) }))
        : undefined,
    });
    if (error) throw new Error(`resend: ${error.name} — ${error.message}`);
    return { providerMessageId: data?.id ?? 'unknown' };
  }

  async verifyEmail(email: string) {
    const trimmed = email.trim().toLowerCase();
    const m = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(trimmed);
    if (!m) return { valid: false as const, reason: 'syntax' as const };
    const domain = m[1]!;
    const localPart = trimmed.slice(0, trimmed.indexOf('@'));

    if (DISPOSABLE.has(domain)) return { valid: false as const, reason: 'disposable' as const };
    if (ROLE_LOCALPARTS.has(localPart)) return { valid: false as const, reason: 'role' as const };

    let hasMx = mxCache.get(domain);
    if (hasMx === undefined) {
      try {
        const records = await resolveMx(domain);
        hasMx = records.length > 0;
      } catch {
        hasMx = false;
      }
      mxCache.set(domain, hasMx);
    }
    if (!hasMx) return { valid: false as const, reason: 'no_mx' as const };

    return { valid: true as const };
  }
}
