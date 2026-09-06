# Kash Network

Custom-coded affiliate + subscription platform: marketing funnel, gated free/paid
dashboards, admin panel, automated email nurture, AI email responder.

**One Next.js app** (App Router). Marketing pages SSR'd for SEO; dashboard is
client-rendered; all backend logic lives in `app/api/*` route handlers + Vercel
Cron. Postgres via `DATABASE_URL` (PGlite locally when unset).

## Run it

```
pnpm install
cp .env.example .env.local     # already present; edit if needed
pnpm dev                        # http://localhost:3000
```

Local admin (seeded on boot from `.env.local`): `admin@kash.network` / `localdev123`.

```
pnpm build          # next build
pnpm test           # vitest (12 tests: route handlers + SqlRepo on PGlite)
pnpm typecheck
pnpm db:migrate     # apply supabase/migrations/*.sql to DATABASE_URL (or local PGlite)
pnpm db:reset       # wipe local PGlite + re-migrate
pnpm create-admin --email <e> --password <p>
```

## Layout

```
src/
  app/            Next App Router
    (marketing)   /trial (video gate), /activate (sales), /secure-checkout
    /login  /app  (dashboard shell + panels)
    api/          route handlers — leads, auth, me, support, notifications,
                  track, admin/*  (M2 adds webhooks + cron)
  server/         framework-agnostic backend
    db/           Repo port + SqlRepo (Postgres/PGlite) + InMemoryRepo (tests)
    auth/         scrypt passwords, own sessions (hashed cookie tokens)
    adapters/     PaymentProvider / EmailProvider / AiProvider — fakes for now
    services/     account state -> visible tabs
    http.ts       route() wrapper, ApiError
  components/     shadcn/ui + marketing components (ported from Lovable) + app shell
  screens/        page-level components rendered by app/ routes
  content/        sales-page.ts, legal.ts (real copy from Lovable)
  shared/         domain enums + adapter port types
supabase/migrations/   ordered SQL (name kept for familiarity)
scripts/               db + create-admin (tsx)
tests/                 vitest
docs/
```

## Design system

Ported from the client's Lovable "Kash Affiliate Hub" build: Tailwind v4 tokens,
Inter + Outfit fonts, shadcn components, and the actual sales/legal copy. Images
are placeholders (`src/assets/*.asset.json`) pending real files from the client.

## Principles

1. Backend logic is framework-agnostic (behind the `Repo` port + adapter ports).
2. We own the money logic; Explodely is just the payment/rebill event source.
3. All third parties behind adapters with fakes.
4. Payment events are append-only and are the audit trail.
5. Any money ambiguity → commission stays held, never auto-pays.

Status + details: `docs/MILESTONE-1.md`, `docs/ARCHITECTURE.md`, `docs/CLIENT-QUESTIONS.md`.
