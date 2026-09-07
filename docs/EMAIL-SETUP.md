# Email setup — Resend + Namecheap DNS

Skipping Google Workspace SMTP (send limits). All mail goes through **Resend**.

Two isolated sending subdomains of `kash.network`:

| Address | Subdomain to verify in Resend | Used for |
|---|---|---|
| `harley@go.kash.network` | `go.kash.network` | 30-day nurture sequence (outbound) |
| `support@app.kash.network` | `app.kash.network` | support form + AI replies |

Verifying each subdomain independently keeps their reputations separate — a
problem on one doesn't drag down the other.

---

## What Claude does (needs `RESEND_API_KEY`)

1. `POST /domains` in Resend for `go.kash.network` and `app.kash.network`
   (region: us-east-1).
2. Read back the exact DNS records Resend generates (MX + SPF TXT on the
   `send.` host, a DKIM TXT at `resend._domainkey`, and a DMARC TXT).
3. Fill the table below with the real values.
4. After you add them in Namecheap, trigger verification and send a test from
   each address.

## What you do (Namecheap)

Namecheap → Domain List → `kash.network` → **Manage → Advanced DNS**.

- Namecheap's default (BasicDNS) has **no proxy** — the Cloudflare/Sucuri
  "grey cloud / DNS only" warning in the brief doesn't apply here. If the domain
  is ever moved to Cloudflare, every record below must be **DNS only**.
- Host field: Namecheap auto-appends `.kash.network`, so enter `send.go`,
  `resend._domainkey.go`, `_dmarc.go`, etc. — **not** the full FQDN.
- TTL: Automatic.

### Records to add (Claude fills these once the domains are created)

**go.kash.network**

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `send.go` | _(pending)_ | 10 |
| TXT | `send.go` | `v=spf1 include:amazonses.com ~all` | — |
| TXT | `resend._domainkey.go` | _(pending — long p= key)_ | — |
| TXT | `_dmarc.go` | `v=DMARC1; p=none;` | — |

**app.kash.network**

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `send.app` | _(pending)_ | 10 |
| TXT | `send.app` | `v=spf1 include:amazonses.com ~all` | — |
| TXT | `resend._domainkey.app` | _(pending — long p= key)_ | — |
| TXT | `_dmarc.app` | `v=DMARC1; p=none;` | — |

> The MX + DKIM values are unique per domain and only appear in Resend after the
> domain is added. Do not guess them.

Propagation is usually 5–30 min (can be up to a few hours). Resend shows each
record flip to "Verified".

---

## Inbound (lead replies → AI) — Milestone 3

For the AI agent, replies to `harley@go.kash.network` need to be received. Resend
supports inbound parsing (an MX pointing at Resend + a webhook to
`/api/webhooks/email-inbound`). That's wired in M3; the sending setup above is
what's needed now.

## Code

- Sending goes through `ResendEmailProvider` (`src/server/adapters/resend.ts`),
  active whenever `RESEND_API_KEY` is set.
- `verifyEmail` (video gate) = syntax + disposable-list + live MX lookup. Good
  enough to block obvious fakes without a paid validation service; swap in
  ZeroBounce/Kickbox later via `EMAIL_VERIFY_PROVIDER`.
- Addresses come from `EMAIL_FROM_HARLEY` / `EMAIL_FROM_SUPPORT` / `SUPPORT_INBOX`.
