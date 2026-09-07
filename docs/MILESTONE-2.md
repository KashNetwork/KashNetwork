# Milestone 2 — Payments, Subscriptions & Affiliate System

Status: **built + tested locally.** Not deployed yet. Runs on fake/simulated
payments until Explodely credentials arrive — the real adapter is written and
switches on automatically when `EXPLODELY_IPN_SECRET` is set.

## What's built

### Payment ingestion
- `POST /api/webhooks/explodely` — IPN endpoint. Verifies signature (HMAC-SHA256
  of the raw body), normalises the payload, records it in `payment_events`
  (append-only, deduped by `${txn}:${type}`), then runs the state machine.
  Always 200s once recorded; failures are retried by the cron.
- `src/server/adapters/explodely.ts` — `verifyWebhook` + `parseEvent`. Maps the
  field names CB-style networks commonly use, with fallbacks. **Needs
  confirming against a real Explodely IPN** (see `CLIENT-QUESTIONS.md §B`).
- `POST /api/dev/sim-payment` — dev-only. Fires any event type through the full
  pipeline so the whole flow is testable without Explodely.

### The state machine (`src/server/services/payments.ts`)
| Event | Effect |
|---|---|
| `trial_started` ($1) | create/reuse profile → `subscriptions` (trialing, 7-day) → resolve attribution → `referrals` row → account becomes **paid + affiliate** (code + 3 links). No commission ($0 on trial). |
| `subscription_activated` / `rebill_succeeded` ($47) | subscription → active, period +30d → **$30 recurring commission** for the referral's affiliate (pending, 30-day hold), referral → active. Idempotent per `(referral, payment_event)`. |
| `rebill_failed` | subscription → past_due, no commission |
| `refunded` / `chargeback` | reverse every commission tied to that transaction, referral → refunded, chargeback also raises a fraud flag |
| `cancel_requested` | `cancel_at_period_end = true`, state → cancelling (keeps access) |
| `subscription_cancelled` | state → cancelled → **downgrade**: account → free/downgraded, affiliate off, links off, downline reassigned to admin, unpaid commissions forfeited |
| `reactivated` | account → paid + affiliate again, **same code**, prior referrals stay with admin (stats start from 0) |

### Attribution (`attribution.ts`)
30-day last-click. Priority: ref code on the purchase → affiliate stored on the
profile at signup → most recent affiliate click for the visitor → admin
fallback. Self-referral (code resolves to the buyer) → dropped to admin + flagged.

### Money (`@/shared` `MONEY`, not yet client-confirmed in writing)
Trial $1 → admin $1 / affiliate $0. Rebill $47 → affiliate $30 / admin $17.

### Commissions & payouts
- 30-day hold: `hold_until = event date + 30d`. `pending` → `available` when the
  hold passes and the source payment hasn't been reversed.
- Cron `GET /api/cron/tick` (Vercel Cron, every 15 min): promotes eligible
  commissions, expires subscriptions whose cancel date passed (backstop for a
  missing/late IPN), retries stuck events.
- Actual cashout requests + admin approval + CSV = Milestone 3.

### Cancellation UI
- `GET/POST /api/me/subscription` — cancel (at period end) / resume.
- Cancel Subscription panel is wired: shows the real period-end date, cancel and
  "never mind" both work, undo available until the period ends.

### Dashboards now show live numbers
- `GET /api/me/dashboard` — clicks, referrals, total/pending commissions, recent
  referrals (masked emails), commission history.
- `GET /api/me/commissions` — wallet / pending / this-month + own $1 and $47
  transactions.
- `GET /api/admin/overview` — real admin revenue ($1/trial + $17/rebill from
  events) and payable balance (affiliate commissions available/requested).

## Tests

`tests/payments.test.ts` — 10 cases: trial → paid affiliate, ref-code
attribution, self-referral drop + flag, idempotency, $30 rebill commission,
replay protection, refund reversal, hold → available promotion, cancel →
downgrade + reassign + forfeit, reactivate → same code. 22 tests total, green.

## Still needs Explodely access

1. Confirm the IPN payload fields + signature scheme → tighten
   `explodely.ts parseEvent` / `verifyWebhook`.
2. The `$1 → $47/mo, 7-day trial` product set up in Explodely, its product ID,
   and the hosted checkout URL for `/secure-checkout`.
3. Whether Explodely returns our `ref` passthrough on every IPN (initial + all
   rebills) — the attribution model depends on it.
4. Written confirmation of the commission split.
