# External integrations — adapter contracts

Every third-party service sits behind a TypeScript interface with a **real** impl
and a **fake** impl. Business logic depends only on the interface. This lets us
build and test Milestone 1–3 logic before any credential arrives.

Interfaces live in `packages/shared/src/ports/`. Implementations in
`apps/api/src/adapters/`.

---

## PaymentProvider (Explodely)

```ts
interface PaymentProvider {
  /** verify an inbound IPN request; throws on bad signature */
  verifyWebhook(headers: Record<string,string>, rawBody: string): void;

  /** normalise a raw IPN payload into our internal event shape */
  parseEvent(rawBody: string): PaymentEvent;

  /** optional: cancel at period end via API, if Explodely supports it */
  cancelSubscription?(externalSubId: string, atPeriodEnd: boolean): Promise<void>;

  /** optional: fetch current refund/chargeback state of a transaction */
  getTransactionState?(externalTxnId: string): Promise<TxnState>;
}

type PaymentEventType =
  | 'trial_started'        // $1 paid, 7-day trial begins
  | 'subscription_activated' // first $47 cleared
  | 'rebill_succeeded'     // subsequent $47
  | 'rebill_failed'
  | 'refunded'
  | 'chargeback'
  | 'cancel_requested'     // user asked to cancel
  | 'subscription_cancelled' // access actually ends
  | 'reactivated';

interface PaymentEvent {
  type: PaymentEventType;
  externalTxnId: string;
  externalSubId: string | null;
  customerEmail: string;
  amountCents: number;
  currency: string;
  affiliateRef: string | null;   // our passthrough code, if Explodely returns it
  occurredAt: string;            // ISO
  raw: unknown;
  dedupeKey: string;             // `${externalTxnId}:${type}`
}
```

**Unknowns to resolve (see CLIENT-QUESTIONS B):** exact event names, payload
fields, signature scheme, whether a passthrough `ref` survives to rebill IPNs,
whether cancel-at-period-end is supported.

**Fake:** an HTTP endpoint + CLI script that emits any of these events for a given
email, so we can drive the full lifecycle locally.

---

## EmailProvider (Resend + Google SMTP)

```ts
interface EmailProvider {
  send(msg: {
    from: 'harley@kash.network' | 'support@kash.network';
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
    tags?: Record<string,string>;   // e.g. { kind: 'nurture', step: '3' }
  }): Promise<{ providerMessageId: string }>;

  /** real-time deliverability / validity check for the video gate */
  verifyEmail(email: string): Promise<{
    valid: boolean;
    reason?: 'syntax' | 'disposable' | 'no_mx' | 'undeliverable' | 'role';
  }>;
}
```

- Outbound nurture + AI = Resend. The `from` addresses are Google-hosted, so the
  domain's SPF/DKIM must authorise Resend **and** Google.
- `verifyEmail` may be a separate provider (ZeroBounce/Kickbox/etc.) — kept on this
  interface for convenience; the adapter can call whichever service.
- **Fake:** logs to a table + console; `verifyEmail` rejects a hardcoded
  disposable-domain list and anything matching `@example.*`.

---

## AiProvider (OpenAI / Google AI Studio)

```ts
interface AiProvider {
  complete(input: {
    system: string;                       // client-supplied prompt
    messages: { role: 'user' | 'assistant'; content: string }[];
    maxOutputTokens: number;
  }): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }>;
}
```

- Adapter also enforces the monthly cost cap and per-lead rate limit before
  calling out.
- `{{affiliate_link}}` substitution happens in the AI-responder service **after**
  `complete()` returns, not inside the adapter.
- **Fake:** returns a canned short reply that includes `{{affiliate_link}}`.

---

## InboundEmail

Not an outbound adapter — an HTTP webhook `POST /api/webhooks/email-inbound`
normalised to:

```ts
interface InboundEmail {
  from: string;
  to: string;                 // harley@ or support@
  subject: string;
  text: string;
  html: string | null;
  inReplyToProviderId: string | null;
  receivedAt: string;
}
```

Each candidate provider (Resend inbound, Cloudflare Email Routing, Gmail push)
gets a small parser mapping its payload to this shape. Decision pending (question 12).

---

## Database (Postgres)

Not behind an adapter in the third-party sense, but it *is* behind the `Repo`
port with two interchangeable SQL backends:

- **Local dev:** PGlite — Postgres compiled to WASM, in-process, no Docker,
  persisted to `apps/api/.pglite`. Migrations auto-apply on boot.
- **Staging/prod:** any hosted Postgres via `DATABASE_URL` (`pg` pool). Could be
  Supabase's Postgres, Neon, RDS, Fly Postgres — the app only needs a connection
  string. We do **not** use `supabase-js` / PostgREST / Supabase Auth; the
  frontend never touches Postgres directly.

`SqlRepo` is one implementation of `Repo` written in portable SQL that runs on
both. `InMemoryRepo` is a third implementation used only by unit tests.

Auth is custom (see ARCHITECTURE §4): `sessions` table (hashed opaque token in
an httpOnly cookie) + scrypt password hashes on `profiles`.
