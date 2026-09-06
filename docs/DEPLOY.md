# Deploying to Vercel

The app is one Next.js project — Vercel deploys it with zero config. Two things
must happen first (both need you, once):

## 1. Connect the repo to Vercel

The Vercel team ("Dan Kunle Adelusi's projects") can't see
`github.com/KashNetwork/KashNetwork` yet — its GitHub App is only installed on
the `DanKunleLove` account.

- Vercel dashboard → **Add New… → Project → Import Git Repository**
- If `KashNetwork/KashNetwork` isn't listed: **Adjust GitHub App Permissions** /
  "Configure GitHub App" → add the `KashNetwork` account (or just that repo).
- Framework preset auto-detects **Next.js**. Root directory: `/` (leave default).
- Don't deploy yet — add env vars first (next step), or deploy and redeploy.

Once connected, every push to `main` auto-deploys, and pushes to other branches
get preview URLs.

## 2. Set environment variables

Vercel project → **Settings → Environment Variables**. Minimum for a working
deploy:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase connection string | Project Settings → Database → Connection string → **URI** (or Transaction pooler). Include the password. Without this the deployed DB does not work. |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-vercel-domain>` (or `https://kash.network` once DNS is pointed) | used to build affiliate links |
| `SEED_ADMIN_EMAIL` | `admin@kash.network` | optional; creates the admin on first boot |
| `SEED_ADMIN_PASSWORD` | (a strong password) | change via Profile after first login |

Everything else (`EXPLODELY_*`, `RESEND_*`, `AI_*`) stays unset until those
integrations land in M2/M3 — the app falls back to fake adapters.

`vercel.json` already runs `db:migrate` at build time when `DATABASE_URL` is set,
so the schema is applied automatically on the first deploy. (It also self-applies
on the first request as a safety net.)

## 3. After it's live

- Tell me the Vercel project is connected and I can manage deploys, check logs,
  and wire env vars via the Vercel connector.
- Point `kash.network` DNS (Namecheap) at Vercel when ready.
- M3 adds Vercel Cron entries to `vercel.json` for the email sequence + commission
  promotion jobs.

## Local vs deployed

| | Local (`pnpm dev`) | Vercel |
|---|---|---|
| DB | PGlite (`./.pglite`, auto-migrate) | Postgres via `DATABASE_URL` |
| Admin | seeded from `.env.local` | seeded from Vercel env (or `pnpm create-admin` against `DATABASE_URL`) |
| Integrations | all fake | fake until keys added |
