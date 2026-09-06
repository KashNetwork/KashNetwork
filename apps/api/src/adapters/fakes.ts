// Fake adapters — used whenever real credentials are absent. They are
// deterministic and side-effect-light so the whole business logic can be
// exercised and tested offline.

import type {
  AiProvider,
  EmailProvider,
  PaymentEvent,
  PaymentProvider,
} from '@kash/shared';

const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'trashmail.com',
  'yopmail.com', 'temp-mail.org', 'sharklasers.com',
]);

export const fakeEmailProvider: EmailProvider = {
  async send(msg) {
    console.log(`[fake-email] ${msg.from} -> ${msg.to} :: ${msg.subject}`);
    return { providerMessageId: `fake-${Date.now()}-${Math.random().toString(36).slice(2)}` };
  },
  async verifyEmail(email) {
    const at = email.lastIndexOf('@');
    if (at < 1 || !email.includes('.', at)) return { valid: false, reason: 'syntax' };
    const domain = email.slice(at + 1).toLowerCase();
    if (DISPOSABLE.has(domain)) return { valid: false, reason: 'disposable' };
    if (/^(example\.|test\.)/.test(domain) || domain === 'example.com')
      return { valid: false, reason: 'undeliverable' };
    return { valid: true };
  },
};

export const fakeAiProvider: AiProvider = {
  async complete(input) {
    const lastUser = [...input.messages].reverse().find((m) => m.role === 'user');
    const text =
      `Totally hear you${lastUser ? ` on "${lastUser.content.slice(0, 40)}"` : ''}. ` +
      `It's genuinely just $1 to look under the hood, and you can cancel in one click. ` +
      `Start here: {{affiliate_link}}`;
    return { text, usage: { inputTokens: 200, outputTokens: 60 } };
  },
};

// The fake payment provider does no signature check and expects a JSON body that
// already matches PaymentEvent (minus dedupeKey, which it derives). A companion
// dev script / route can POST these to /api/webhooks/explodely.
export const fakePaymentProvider: PaymentProvider = {
  verifyWebhook() {
    /* no-op in fake mode */
  },
  parseEvent(rawBody) {
    const p = JSON.parse(rawBody) as Partial<PaymentEvent>;
    if (!p.type || !p.externalTxnId || !p.customerEmail) {
      throw new Error('fake payment event missing type/externalTxnId/customerEmail');
    }
    return {
      type: p.type,
      externalTxnId: p.externalTxnId,
      externalSubId: p.externalSubId ?? null,
      customerEmail: p.customerEmail,
      amountCents: p.amountCents ?? 0,
      currency: p.currency ?? 'USD',
      affiliateRef: p.affiliateRef ?? null,
      occurredAt: p.occurredAt ?? new Date().toISOString(),
      raw: p,
      dedupeKey: `${p.externalTxnId}:${p.type}`,
    };
  },
};
