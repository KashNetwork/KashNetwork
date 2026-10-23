// Turns whatever the email provider POSTs into our normalised InboundEmail.
// Accepts (1) our own flat shape — {from,to,subject,text,html} — which any
// forwarder or test can send, and (2) Resend's "email.received" event. Resend's
// event carries metadata only, so the body is fetched with the API key.

import type { InboundEmail } from '@/shared';
import { config } from '../config';

type Json = Record<string, any>;

const first = (v: unknown): string => (Array.isArray(v) ? String(v[0] ?? '') : String(v ?? ''));

export async function parseInboundEmail(body: Json): Promise<InboundEmail> {
  const d: Json = body?.type === 'email.received' && body.data ? body.data : body;

  let text = String(d.text ?? '');
  let html: string | null = d.html ? String(d.html) : null;

  if (!text && !html && body?.type === 'email.received' && d.email_id && config.resend.apiKey) {
    const res = await fetch(`https://api.resend.com/emails/receiving/${d.email_id}`, {
      headers: { authorization: `Bearer ${config.resend.apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const full = (await res.json()) as Json;
      text = String(full.text ?? '');
      html = full.html ? String(full.html) : null;
    }
  }
  if (!text && html) text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').trim();

  const from = first(d.from);
  const to = first(d.to);
  if (!from || !to) throw new Error('inbound email needs from and to');

  return {
    from,
    to,
    subject: String(d.subject ?? ''),
    text,
    html,
    inReplyToProviderId: d.in_reply_to ? String(d.in_reply_to) : d.inReplyTo ? String(d.inReplyTo) : null,
    receivedAt: new Date().toISOString(),
  };
}
