# Milestone 3 — Payouts, Email Automation & AI Agent

## Status against the scope

| Scope item | Status |
|---|---|
| Affiliate cashout system | Done. Commissions tab, $30 minimum, payout method saved on profile. |
| 30-day commission holding period | Done (M2). Hourly cron promotes pending to available. |
| Admin payout approval | Done. Payouts tab: approve and mark paid, or reject (commissions go back to available). |
| Payout status tracking | Done. requested / approved / paid / rejected, shown to affiliate and admin. |
| Commission reversal logic | Done (M2 + M3). Refund and chargeback reverse commissions; past-due freezes cashouts. |
| Loops.so integration | Replaced by Resend, as agreed (Loops is not used). |
| 30-day email follow-up automation | Done. 30-day free-lead sequence, runs from the cron. Sends only when RESEND_API_KEY is set. |
| Lead management | Done. Every lead has sequence state; admin Customers list filters free leads. |
| Purchase/conversion-based email automation | Done. Paying the $1 trial stops the sequence. |
| Affiliate links within emails | Done. `{{affiliate_link}}` resolves to the credited affiliate's link, or the admin's. |
| SMTP/email configuration | Resend adapter built. Needs the sending domain verified (DNS) and the key set. |
| AI email agent integration | Done. Anthropic, OpenAI or Google, chosen by AI_PROVIDER. Fake until a key is set. |
| AI-generated responses | Done. Short replies as Harley (leads) or Kash Support (support@). |
| Support email integration | Done. Inbound endpoint creates tickets and answers general questions. |
| AI and automated sequence coordination | Done. A reply from a lead stops their drip and hands them to the AI thread. |

## How the AI agent behaves

- A lead replies to a sequence email: the drip stops, the AI answers (max 6 replies per thread, 200 per day overall).
- "Unsubscribe", "stop emailing" and similar: everything stops, no reply is sent.
- Refund, billing, cancellation, legal or complaint wording: no AI reply. A support ticket is created and support@ is notified.
- Unknown senders writing to Harley go to a person. Auto-replies, bounces and the system's own mail are ignored.
- The AI is told never to promise income or results, and never to discuss refunds or billing.

## Turning it on (environment variables, Vercel > Settings > Environment Variables)

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Resend key, after the sending domain shows Verified |
| `EMAIL_FROM_HARLEY`, `EMAIL_FROM_SUPPORT`, `SUPPORT_INBOX` | Addresses on the verified domain |
| `AI_PROVIDER` | `anthropic`, `openai` or `google` |
| `AI_API_KEY` | Key from that provider |
| `AI_MODEL` | Optional. Defaults: claude-haiku-4-5, gpt-4o-mini, gemini-3.5-flash-lite |
| `INBOUND_EMAIL_SECRET` | Any long random string. The inbound endpoint is closed without it. |

Inbound endpoint: `POST https://kash.network/api/webhooks/inbound-email?secret=<INBOUND_EMAIL_SECRET>`
Accepts `{ from, to, subject, text, html }` or a Resend `email.received` event.
Point the email provider's inbound/forwarding at that URL.
