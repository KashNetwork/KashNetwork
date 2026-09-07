# Milestone 1 — Application Foundation & User System

Status: **complete + deployed live.**

- **Live:** https://kash-network.vercel.app
- Repo: https://github.com/KashNetwork/KashNetwork (`main`)
- One Next.js 15 app. Marketing pages SSR'd; dashboard client-rendered; backend
  in `src/app/api/*` route handlers.

## Run locally

```
pnpm install
pnpm dev            # http://localhost:3000  (PGlite, no Docker, auto-migrates)
pnpm test           # 12 tests
pnpm typecheck
pnpm build
```

Local admin (seeded from `.env.local`): `admin@kash.network` / `localdev123`.

## Live environment

| | Value |
|---|---|
| Host | Vercel — project `kash-network`, scope "Tobiloba Olujimi's projects" |
| DB | Supabase Postgres `cnjakpqizkplmpxxzrbh`, connected as a dedicated `kash_app` role via the **session pooler** (`aws-1-us-east-2.pooler.supabase.com:5432`). Not Supabase Auth / PostgREST — just Postgres. |
| Migrations | `0001` + `0002` applied; 20 tables + seeded notifications |
| Admin | `admin@kash.network` / `Knj9_T_NvWrp0L` (rotate via Profile tab) |
| Deploys | manual — `npx vercel deploy --prod --token <VT>` from repo root. Not git-connected yet (Vercel GitHub App not installed on the `KashNetwork` GH account). |
| Integrations | Explodely / Resend / AI / email-verify all on **fake adapters** until keys land (M2/M3) |

## Scope vs. delivered

| M1 line item | Status |
|---|---|
| Custom project setup & architecture | ✅ Next.js app, `docs/ARCHITECTURE.md` |
| Database setup | ✅ SQL migrations, Supabase in prod / PGlite locally |
| User authentication | ✅ custom (own sessions + scrypt) |
| Email verification | ✅ via `EmailProvider.verifyEmail` (fake list until a provider key) |
| Free & paid account states | ✅ `account_type` + `free_variant` → visible tabs |
| User profiles | ✅ name / email-change-with-confirm / password |
| Free-user dashboard | ✅ single "Harley's Story" tab (sales page / reactivate screen) |
| Paid-user dashboard structure | ✅ all 6 tabs |
| Video/content gating + email capture | ✅ gate @ 1:53, reveal @ 3:35, `POST /api/leads` |
| Initial admin dashboard | ✅ overview cards + customer list + filters |
| Core DB structure | ✅ full schema incl. payouts, leads, email, fraud, audit |
| Responsive frontend foundation | ✅ Tailwind v4 + Lovable design system, light theme |

## Deferred (later milestones)

- Dashboard/Commissions **numbers** → M2 (Explodely IPN → commissions/referrals).
- Checkout embed, cancel/reactivate execution → M2.
- Cashout flow, email sequences, AI agent → M3.
- Admin status-override UI button, referral reassignment UI, CSV export, live
  fraud rules → M4 (the status-override **API** exists + is tested).

## Placeholders needing client content

- Landing + Buy Traffic videos (currently Big Buck Bunny placeholder; timestamps
  1:53 / 3:35 confirmed in code).
- Real image files — `src/assets/*.asset.json` point at placehold.co. Need the
  founder photo, results screenshots, 3 testimonial photos, highlight graphic.
- Buy Traffic destination URL.
- Approved social-proof lines (10 placeholders seeded).
- A real `EmailProvider.verifyEmail` provider.

## To enable auto-deploy on push

Install the **Vercel GitHub App** on the `KashNetwork` GitHub account → Vercel
project `kash-network` → Settings → Git → Connect `KashNetwork/KashNetwork`.
Until then, deploys are manual via the Vercel token.
