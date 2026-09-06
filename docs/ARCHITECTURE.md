# Kash Network — System Architecture

Status: **draft v0.1** — foundation phase, no external credentials yet.
Owner: build team. Client: Kash Network (Harley).

---

## 1. What we are building

A custom-coded affiliate + subscription platform. Marketing funnel on `kash.network`,
a gated app (free + paid dashboards), an admin panel, an automated email nurture
system, and an AI email responder.

Money flow:

| Event | Customer pays | Affiliate gets | Admin gets |
|---|---|---|---|
| $1 / 7-day trial | $1 once | $0 | $1 |
| Monthly rebill | $47 / mo | $30 / mo | $17 / mo |

(Numbers per current spec — **not yet client-confirmed**, see `CLIENT-QUESTIONS.md`.)

---

## 2. Design principles

1. **The backend is frontend-agnostic.** It is a standalone REST/JSON API + Postgres
   (Supabase). Whatever renders the UI — a Lovable-generated React app, or a
   hand-written one — talks to the same documented API. If the Lovable codebase
   arrives, we keep its components and replace its data layer with our API client.

2. **We own the money logic, not Explodely.** Explodely is the merchant of record
   and the rebill engine. It tells us "a payment happened / failed / was refunded"
   via IPN. *We* decide attribution, compute the $30 / $17 split, run the 30-day
   payout hold, and handle reversals. Explodely's own affiliate engine is treated
   as a secondary signal at most, never the source of truth. Rationale: the split
   is custom ($0 upfront, $30 flat recurring), the hold and manual-approval flow
   is custom, and the cancel/reassign-to-admin rules are custom — none of that
   maps cleanly onto a hosted affiliate network.

3. **All external services sit behind adapter interfaces.** `PaymentProvider`,
   `EmailProvider`, `AiProvider`. Each has a real implementation and a fake. The
   entire business logic is built and tested against fakes now; real credentials
   drop in later with no logic changes. See `EXTERNAL-INTEGRATIONS.md`.

4. **Payment events are append-only and are the audit trail.** Every IPN is stored
   raw before it is interpreted. State is derived from events; we can always
   replay.

5. **Fail safe on money.** Any ambiguity (attribution conflict, possible fraud,
   unverified refund state) → commission stays `pending`/`held`, never auto-pays.

---

## 3. Stack

| Concern | Choice |
|---|---|
| Language | TypeScript |
| Framework | **Next.js (App Router)** — one app: SSR marketing pages, client dashboard, `app/api/*` route handlers, Vercel Cron. Deployed to Vercel. |
| DB | Postgres via `DATABASE_URL` (Supabase Postgres / Neon / RDS — connection string only, not the Supabase platform). **Local dev = PGlite** (embedded, no Docker, `./.pglite`) when `DATABASE_URL` is unset. `pg` + `@electric-sql/pglite` are `serverExternalPackages`. |
| DB access | raw SQL behind a `Repo` port (`SqlRepo`). The frontend never connects to Postgres — everything goes through route handlers, so no PostgREST / `supabase-js`. |
| Auth | custom — own sessions (hashed opaque cookie tokens) + scrypt password hashing. Not Supabase Auth (passwordless leads fight it). Cookie set/read via `next/headers`. |
| Migrations | Plain SQL in `supabase/migrations`, applied by a runner on first DB use (local) or `pnpm db:migrate` against `DATABASE_URL` (deploy step). Shipped to the serverless bundle via `outputFileTracingIncludes`. |
| Scheduled jobs | Vercel Cron → dedicated HTTP endpoints (no long-lived intervals — serverless kills them) |
| Transactional / marketing email | Resend (from `harley@kash.network`) + Google SMTP for the Gmail-hosted addresses |
| Inbound email | provider inbound-parse webhook → `/api/webhooks/email-inbound` (candidate: Resend inbound, Cloudflare Email Routing, or Gmail push — TBD, see questions) |
| AI | OpenAI or Google AI Studio (client supplies key + final prompt) |
| DNS | Namecheap (domain/DNS only — not app hosting) |
| Repo | pnpm workspace monorepo |

```
kash/
  apps/
    api/          Express app, Vercel entry, all backend logic
    web/          frontend (placeholder; Lovable drop-in or custom)
  packages/
    shared/       TS types + zod schemas = the API contract, shared by api & web
  supabase/
    migrations/   ordered SQL (name kept for familiarity; not Supabase-specific)
  docs/
```

Local dev needs no cloud accounts: `pnpm install && pnpm dev` starts the API
(PGlite auto-migrates + seeds an admin from `SEED_ADMIN_*`) and the web app.

---

## 4. Identity model

One `profiles` row per human. Every email that enters the system (video gate,
checkout, admin) gets one.

- **Free / lead users**: created passwordless. Client wants them "always logged
  in, no logout, no password." Implementation: create the Supabase auth user with
  no password, issue a long-lived session cookie bound to the browser. They can
  only ever see one screen (Harley's Story or the Reactivate screen).
- **Paid users**: on first upgrade they set a password and get normal
  login/logout.
- **Admin**: `role = 'admin'`, set manually in the DB.

`profiles.account_type` (`free` | `paid`) is the fast gate for UI + API auth.
`profiles.free_variant` distinguishes:
  - `lead` — never paid → Harley's Story tab shows the **sales page** (`/activate`)
  - `downgraded` — cancelled a paid plan → shows **"Reactivate for $47/mo"**, not the sales page

A separate `kn_vid` cookie (random uuid, set on first funnel pageview) tracks the
visitor for click attribution *before* an account exists.

---

## 5. State machines

### 5.1 Subscription (`subscriptions.state`)

```
        $1 trial paid
  none ──────────────► trialing
                          │  trial converts / first $47 clears
                          ▼
                       active ──── payment fails ───► past_due
                          │  ▲                          │
       user cancels       │  │ undo before period end   │ payment recovers
       (cancel_at_        │  │                           ▼
        period_end=true)  │  └───────────────────────  active
                          ▼
                     cancelling ──── period end ───► cancelled
                          │                             │
                          │  reactivate ($47)           │ reactivate ($47)
                          └──────────► active ◄──────────┘
   past_due ── dunning exhausted ──► cancelled
```

- `cancel_at_period_end` is the "pending cancel" flag. Access = paid until
  `current_period_end` regardless.
- The transition to `cancelled` is driven by **either** an Explodely IPN **or**
  our cron noticing `current_period_end` has passed with `cancel_at_period_end`
  true — whichever comes first. Idempotent.

### 5.2 Account downgrade (fires when subscription → `cancelled`)

1. `profiles.account_type = 'free'`, `free_variant = 'downgraded'`, `is_affiliate = false`.
2. `affiliate_code` is retained (so old links 404 gracefully / can be reactivated)
   but all three referral links become **inactive** — clicks are logged but not
   attributed.
3. Every `referrals` row where this person is the affiliate → `affiliate_id`
   reassigned to the admin profile, `admin_reassigned = true`. All *future*
   recurring commissions from those referrals accrue to admin.
4. This affiliate's commissions that are not yet `paid` → `reversed`
   (reason `affiliate_cancelled`). *(Confirm scope with client — see questions.)*
5. Affiliate-facing stats now read 0 (their referrals belong to admin).

### 5.3 Reactivation

- Pays $47 → `account_type = 'paid'`, `is_affiliate = true`, same `affiliate_code`,
  links reactivate.
- Prior referrals **stay with admin** (step 3 above is not undone). Effectively the
  affiliate starts from 0. New clicks/referrals/commissions accrue fresh.

### 5.4 Commission (`commissions.status`)

```
 created ──► pending ──(hold_until reached AND source payment still good)──► available
   │            │                                                              │
   │            │ source payment refunded / charged back / affiliate cancelled  │ affiliate
   │            ▼                                                               │ requests
   │         reversed (terminal)                                               ▼
   │                                                                        requested
   │                                                              admin approve │  │ admin reject
   │                                                                            ▼  ▼
   │                                                                   paid ◄──┘  pending
   └── trial commission: created directly as `reversed`? no — created as         (or rejected
       `pending` with amount 0, or simply not created. Decision: DO NOT create    terminal)
       a commission row for the $1 trial. First commission is the first $47 rebill.
```

- `hold_until = created_at + 30 days`.
- A daily cron promotes `pending` → `available` when `hold_until` passed **and**
  the generating `payment_event` has not been reversed.
- Refund / chargeback IPN on a payment → every commission with that
  `payment_event_id` goes `reversed`, even if already `available` or `requested`
  (not if already `paid` — that becomes a negative balance / clawback flag for
  admin).

### 5.5 Payout / cashout (`payouts.status`)

```
 affiliate requests (needs available balance > 0 and a payout method on file)
   └─► requested ──► admin approves ──► approved ──► admin marks paid ──► paid
                 └─► admin rejects (reason) ──► rejected
                     (linked commissions return to `available`)
```

- On `requested`: linked commissions move `available` → `requested` (locked).
- On `paid`: linked commissions → `paid`, `paid_at = now()`.
- CSV export of the `requested`/`approved` queue for batch PayPal/bank payment.

### 5.6 Email nurture (`lead_state.sequence_status`)

```
 free signup ─► active ──(step N sent, was last)──► completed
                  │
                  ├── $1 trial purchased ──► converted  (sequence stops)
                  └── admin/manual stop ──► stopped
```

Inbound replies do **not** stop the sequence (per spec — lead keeps getting
`harley@` emails until purchase or day 30).

---

## 6. Attribution (30-day last-click)

1. Visitor hits any funnel page with `?ref=CODE` (or a `/r/CODE` short redirect).
   Middleware:
   - ensures `kn_vid` cookie (uuid).
   - if `CODE` resolves to a *currently active* affiliate: insert `clicks` row;
     set/refresh `kn_ref` cookie = `CODE`, `Max-Age` 30 days (refresh on every
     click = last-click wins).
2. Email submitted at the 1:53 gate → create `profile`; copy `kn_ref` →
   `profiles.referred_by_affiliate_id` (tentative); store `kn_vid`.
3. Purchase IPN → **resolve + lock attribution**:
   - candidate A: `kn_ref` / most recent `clicks` row for this `kn_vid` or email
     within 30 days.
   - candidate B: affiliate reported by Explodely (if we end up passing `ref`
     through as a passthrough field).
   - reconcile (A wins by default); run fraud checks (§7); write `referrals` row
     with `attribution_locked = true`.
4. No valid affiliate → attributed to admin.

Email nurture links use the **tentative** affiliate from step 2 (or admin), so a
lead who came through affiliate X keeps seeing X's sales link in emails.

---

## 7. Fraud & safeguards

| Vector | Check | Action |
|---|---|---|
| Self-referral | `referred_by_affiliate_id == purchaser profile` | drop attribution → admin, flag |
| Same person, many accounts | email norm (dots/plus for gmail), IP, user-agent, device fingerprint, payment fingerprint if exposed | flag, hold commissions, block dup signup |
| Disposable / invalid email at gate | real-time verification API + disposable-domain list | reject at gate (video will not resume) |
| Chargeback | Explodely IPN | reverse related commissions, flag affiliate, pause payouts |
| Refund | Explodely IPN | reverse related commissions |
| Cancelled trial (never converted) | no `active` subscription ever | no commission was created — nothing to do |
| Failed recurring payment | `past_due` | no new commission that cycle; existing unaffected |
| Attribution conflict (A vs B disagree) | detected in §6.3 | commission `pending` + admin review, do not auto-resolve |
| Payout timing | 30-day `hold_until` + daily promote job | enforced in data model |
| Payout reserve | configurable % or flat reserve held back on approval | admin setting (v2) |
| Velocity | > N signups / IP / hour, > N cards / affiliate | flag |

All auto-actions are logged to `fraud_flags`; admin can override.

---

## 8. Funnel pages (`kash.network`)

| Path | Purpose | Affiliate link? |
|---|---|---|
| `/trial` | Landing — gated video, email gate @ 1:53, content reveal @ 3:35, `$1` checkout button | **yes** — this is the link affiliates copy/share |
| `/activate` | Sales page | yes (used inside emails + inside free-user "Harley's Story" tab) |
| `/secure-checkout` | Explodely checkout | yes (exists, not shown to affiliates) |

Each affiliate has all three; only `/trial` is surfaced in their dashboard to copy.

### Video gate (`/trial`)

- Player API (Wistia per client notes — confirm) monitors playback time.
- `113s` (1:53): pause + lock, email overlay. Cannot resume until a **valid** email
  is submitted → `POST /api/leads` → creates free account + session → resume.
- `215s` (3:35): reveal the rest of the page (checkout, reviews, etc.).
- Email left but no purchase → account persists as `free` / `lead`, enters nurture.

---

## 9. Dashboards

### Free user — one tab
- **Harley's Story** → renders `/activate` (sales page) for `lead`, or the
  Reactivate screen for `downgraded`. No password UI, no logout.

### Paid user — tabs
- **Dashboard**: total clicks, total referrals, total commissions ($), pending,
  recent referrals, commission history, **referral link** (the `/trial` one) + copy.
- **Commissions** (merged): Wallet (available), Pending (held), Total earnings this
  month, Cashouts (withdraw history), Transactions (this user's own $1 + $47
  payments — not their referrals').
- **Buy Traffic**: headline "GET STARTED", embedded video, big CTA button (new tab).
- **Support**: form → email to `support@kash.network`, from-field pre-filled with
  the logged-in user's email.
- **Profile**: name, email (change requires confirm from new address), password update.
- **Cancel Subscription**: confirm flow + "Never mind" undo (§5.2).

### Admin — tabs
- Dashboard, Customers (incl. Affiliates view), Payouts, Support, Profile, Admin.
- Removed: Products, Campaigns, Training.
- Metric cards: admin revenue, active paid members, free leads, pending payouts.
- User/lead table: search, status filter, manual status override, view affiliate
  link, reassign referrals to admin.
- Payout queue: approve & mark paid / reject w/ reason, CSV export.

---

## 10. Email + AI

### 10.1 Nurture sequence
- 30-day sequence, ordered steps with day offsets, defined in
  `apps/api/src/email/sequences/free-nurture.ts` (content stubbed until client
  delivers copy).
- `/api/cron/email-tick` (every 15 min): find due `lead_state`, render with
  `{{sales_link}} = https://kash.network/activate?ref=CODE`, send via Resend from
  `harley@kash.network`, advance step.
- Stop on: `$1` trial IPN (→ `converted`), or last step (→ `completed`).

### 10.2 AI responder
- Inbound reply to `harley@` → `/api/webhooks/email-inbound` → look up sender in
  `profiles`.
- Open/continue `ai_threads` row. **First** AI reply is prefixed:
  *"Hi, this is Kash! I'm Harley's A.I. assistant and I'll be taking over from here."*
- Context = client system prompt + this lead's affiliate link + last K messages.
- `AiProvider.complete()` → replace `{{affiliate_link}}` → send from
  `support@kash.network`.
- Runs alongside the nurture sequence (does not stop it). Stops when subscription
  becomes active or sequence ends.
- Guardrails: per-lead daily message cap, monthly cost cap, kill switch, admin
  review log.

---

## 11. Live notifications (social proof)

- `notifications` table seeded with client-approved lines
  ("Verified Member from New York — Just earned 3 commissions today! — 4 minutes ago").
- `GET /api/notifications?location=landing` returns a shuffled batch.
- Self-contained widget, **light theme** (client asked for a light variant of the
  dark examples), bottom-left, shown on `/trial` and `/activate`.
- Timing: first at 10–15s, visible 4–6s, next 15–35s later, cap 5–8 per session.
- v2: optionally synthesise lines from real signup/commission events.

---

## 12. Environments

- `local` — fakes for all providers, local Supabase or a dev project.
- `staging` — real Supabase dev project, Explodely sandbox (if available), Resend
  test domain.
- `production` — client accounts, deployed to Vercel, DNS on Namecheap.

Secrets via environment variables only (`.env.example` documents them). Nothing
committed.

---

## 13. Build order (milestones)

1. **Foundation** — this doc, schema, monorepo, auth, adapters + fakes, business
   logic modules (attribution, commission, payout, fraud, cancel/reactivate) with
   unit tests.
2. **Payments + affiliate** — Explodely IPN ingestion, subscription state machine,
   affiliate activation, click/referral tracking, dashboards' data endpoints.
3. **Payouts + email + AI** — cashout flow, admin approval, Resend integration,
   nurture engine, inbound webhook, AI responder.
4. **Admin + security + launch** — admin panel endpoints, fraud rules live,
   notifications, responsive pass, end-to-end tests, deploy, handoff.

Frontend is built in parallel by the team against the API contract in
`packages/shared`.
