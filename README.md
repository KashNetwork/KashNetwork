# Kash Network

Custom-coded affiliate + subscription platform. Marketing funnel, gated free/paid
dashboards, admin panel, automated email nurture, AI email responder.

## Status

Milestone 1 complete. Runs fully locally — no cloud accounts needed.

```
pnpm install
pnpm dev        # API on :4000 + web on :5173
```

Open **http://localhost:5173**. Local admin: `admin@kash.network` / `localdev123`.

See:
- [`docs/MILESTONE-1.md`](docs/MILESTONE-1.md) — what's built, how to run/test
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, state machines
- [`docs/CLIENT-QUESTIONS.md`](docs/CLIENT-QUESTIONS.md) — blocking decisions for the client
- [`docs/EXTERNAL-INTEGRATIONS.md`](docs/EXTERNAL-INTEGRATIONS.md) — adapter contracts

## Layout

```
apps/api        Express backend, all business logic
apps/web        Vite + React + Tailwind frontend
packages/shared TS types + zod schemas = the API contract
supabase/       SQL migrations
docs/
```

## Database

Local dev = **PGlite** (embedded Postgres, no Docker), persisted to
`apps/api/.pglite`, migrations auto-apply on boot. Staging/prod = set
`DATABASE_URL` to any hosted Postgres and run `pnpm --filter @kash/api db migrate`.
No `supabase-js` / Supabase Auth — the frontend only ever talks to our API.

## Principles

1. Backend is frontend-agnostic — one documented API, any UI.
2. We own the money logic; Explodely is just the payment/rebill event source.
3. All third parties behind adapter interfaces with fakes.
4. Payment events are append-only and are the audit trail.
5. Any money ambiguity → commission stays held, never auto-pays.

## Commands

```
pnpm dev                            # both servers
pnpm --filter @kash/api test        # 15 tests
pnpm -r typecheck
pnpm --filter @kash/api db reset     # wipe + re-migrate local DB
pnpm --filter @kash/api create-admin --email <e> --password <p>   # prod (DATABASE_URL)
```
