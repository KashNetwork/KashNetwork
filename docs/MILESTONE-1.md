# Milestone 1 — Application Foundation & User System

Status: **complete (foundation)**. Runs fully locally with no cloud accounts.
Data-heavy dashboard panels are structured shells that get wired to live data in
Milestone 2.

## How to run it

```
pnpm install
pnpm dev          # starts BOTH: API on :4000, web on :5173
```

Open **http://localhost:5173** — that's the app.

- `/trial` — landing + gated video (use the DEV skip buttons on the player to
  jump to the 1:53 email gate and the 3:35 content reveal)
- submit an email at the gate → a free account is created, you land in the app
  with only the **Harley's Story** tab
- `/login` — paid/admin login. Local admin (seeded on boot):
  **admin@kash.network / localdev123** (from `SEED_ADMIN_*` in `apps/api/.env`)

Other commands:

```
pnpm --filter @kash/api dev        # API only
pnpm --filter @kash/web dev        # web only
pnpm --filter @kash/api test       # 15 tests (in-memory + real PGlite)
pnpm -r typecheck
pnpm --filter @kash/api db reset   # wipe local PGlite + re-migrate
```

## Database — local only, no live Supabase

Per the project decision, there is **no hosted/live database**. Local dev uses
**PGlite** (embedded Postgres, no Docker), persisted to `apps/api/.pglite`
(gitignored). Migrations in `supabase/migrations/` auto-apply on boot.

Staging/production later: set `DATABASE_URL` to any hosted Postgres connection
string and run `pnpm --filter @kash/api db migrate`. The code path is identical
(`SqlRepo` runs the same SQL on both). `supabase-js` / Supabase Auth are not used.

> The hosted Supabase project the client shared was briefly used to validate the
> schema, then **wiped back to an empty `public` schema**. The management token
> should still be rotated. Nothing is deployed anywhere.

## Scope vs. delivered

| M1 line item | Status | Where |
|---|---|---|
| Custom project setup and architecture | ✅ | `docs/ARCHITECTURE.md`, pnpm monorepo |
| Database setup | ✅ local PGlite + SQL migrations (20 tables) | `supabase/migrations/`, `apps/api/src/db/` |
| User authentication | ✅ custom (sessions + scrypt) | `apps/api/src/auth/*` |
| Email verification | ✅ via `EmailProvider.verifyEmail` (fake list until a provider key is added) | `apps/api/src/routes/leads.ts` |
| Free & paid user account states | ✅ `account_type` + `free_variant` | `presentMe()` |
| User profiles | ✅ name / email-change-with-confirm / password | `routes/{me,auth}.ts`, Profile panel |
| Free-user dashboard | ✅ single "Harley's Story" tab (sales page / reactivate screen) | `apps/web/src/app/panels.tsx` |
| Paid-user dashboard structure | ✅ all 6 tabs | same |
| Video/content gating + email capture | ✅ gate @ 1:53, reveal @ 3:35, `POST /api/leads` | `apps/web/src/components/VideoGate.tsx` |
| Initial admin dashboard | ✅ overview cards + customer list + filters | admin panels + `routes/admin.ts` |
| Core DB structure (users, subs, affiliates, referrals, transactions, commissions) | ✅ full schema incl. payouts, leads, email, fraud, audit | `0001_initial_schema.sql` |
| Responsive frontend foundation | ✅ Tailwind, responsive shell (sidebar↔topbar), light theme | `apps/web` |

## Deferred to later milestones

- Dashboard/Commissions **numbers** → M2 (Explodely IPN feeding `commissions`/`referrals`).
- Cancel/reactivate execution, checkout embed → M2.
- Cashout requests, email sequences, AI → M3.
- Admin status-override UI button, referral reassignment UI, CSV export, live
  fraud rules → M4 (the status-override **API** exists and is tested).

## Placeholders needing client content before launch

- Landing + Buy Traffic videos (sample MP4 / placeholder box) — timestamps
  1:53 / 3:35 confirmed in code.
- Sales-page copy, landing reviews.
- Buy Traffic destination URL (`panels.tsx`, `BuyTrafficPanel`).
- Social-proof lines — 10 placeholder rows seeded (`0002_seed_notifications.sql`).
- A real `EmailProvider.verifyEmail` provider (ZeroBounce/Kickbox/etc.).

## Security notes

- Sessions: opaque token, sha-256 at rest, httpOnly cookie. Lead sessions ~10y
  (passwordless per spec); user sessions 30d sliding, revoked on logout / password
  change.
- RLS enabled on all tables with no policies (default deny) as defense-in-depth.
- No secrets in the repo. `apps/api/.env` (gitignored) holds only local dev values.
