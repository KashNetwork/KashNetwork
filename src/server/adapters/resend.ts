import { Resend } from 'resend';
import type { EmailProvider } from '@/shared';
import { config } from '../config';
import { verifyEmailByDns } from './email-verify';

/**
 * Resend-backed EmailProvider.
 *
 * `send` goes through Resend. `verifyEmail` is the shared syntax + disposable
 * + live-DNS check (Resend has no address-validation API) — same logic the
 * fake provider uses, so verification doesn't depend on whether sending is
 * configured. Swap in ZeroBounce/Kickbox later by pointing
 * EMAIL_VERIFY_PROVIDER at it.
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
    return verifyEmailByDns(email);
  }
}
