# apps/web — frontend (placeholder)

Not built yet. Two possible sources:

1. **Client's Lovable codebase** — if it arrives, its React components move here
   and its data layer is replaced with a client for `@kash/api` (types from
   `@kash/shared`).
2. **Hand-built** — if no Lovable code comes, build here directly.

Either way the frontend only talks to the documented API. Nothing about the
backend depends on this choice.

Screens to build: funnel pages (`/trial`, `/activate`, `/secure-checkout`),
free-user shell (Harley's Story), paid-user dashboard (Dashboard, Commissions,
Buy Traffic, Support, Profile, Cancel Subscription), admin panel. See
`docs/ARCHITECTURE.md` §8–§11.
