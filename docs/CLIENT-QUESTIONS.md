# Blocking questions / decisions for the client

Grouped by how much they block. Send this before/alongside Milestone 1.

---

## A. Hard blockers — cannot finalise money logic without these

1. **Commission split — confirm in writing.**
   Current understanding: trial $1 → admin $1 / affiliate $0. Rebill $47 →
   affiliate $30 / admin $17. The quote noted the source doc has conflicting
   numbers elsewhere. Please confirm the single correct table.

2. **Who eats payment processing fees?** Explodely + processor fees on the $1 and
   $47 — do they come out of the admin $17, or off the top before the split?

3. **"Forfeit any/all commission payouts" on cancellation — scope.**
   When a paid user cancels and is downgraded, do they forfeit:
   (a) only commissions still in the 30-day hold, or
   (b) all commissions not yet paid out (including approved-but-unpaid), or
   (c) everything including already-paid (clawback)?
   We assume (b).

4. **Affiliate must be "active" to earn — confirm.** If affiliate X refers a
   customer, then X cancels, the customer keeps rebilling: those future $30
   commissions go to admin (X gets nothing), correct? And if X reactivates later,
   they still do **not** get that old customer back?

5. **Payout methods.** Which do you support — PayPal, Cash App, bank/ACH, other?
   What identifier do we collect from the affiliate and store?

6. **Minimum payout threshold?** e.g. no cashout under $50. And any payout
   reserve held back (% or flat) against future chargebacks?

---

## B. Explodely integration — need answers from the Explodely account/docs

7. **Does Explodely support a $1 trial → $47/mo rebill product with a 7-day trial
   window natively?** Product/pricing config screenshot.

8. **IPN / webhook:** exact event types Explodely sends (sale, rebill, refund,
   chargeback, cancel, trial-convert, failed-rebill, reactivate...), the payload
   schema for each, and how signatures/verification work.

9. **Affiliate tracking:** do we (a) create an Explodely affiliate per paid user
   and use Explodely's links + cookie, or (b) pass our own `ref` code through as a
   custom/passthrough field and ignore Explodely's affiliate engine? We lean (b) —
   we compute commissions ourselves. Does Explodely allow a passthrough field that
   comes back on every IPN (initial + rebills)?

10. **Refund/chargeback window:** does Explodely notify on chargebacks, and is
    there an API to query a transaction's current refund state?

11. **Cancellation:** can a cancel be triggered via Explodely API from our
    dashboard, or must the user do it in Explodely's portal? Does "cancel at period
    end" exist, or is cancel immediate?

---

## C. Email + AI

12. **Inbound email handling.** `harley@` and `support@` will be Google Workspace.
    How should we receive replies for the AI? Options: (a) Google Workspace routing
    rule → forward to a parse address (Resend inbound / Cloudflare), (b) Gmail API
    push notifications, (c) a dedicated inbox we poll. Preference?

13. **AI provider + key.** OpenAI or Google AI Studio? Model? Monthly spend cap?

14. **Final AI system prompt + knowledge base** (the doc has a draft — is it final?).

15. **Nurture sequence:** how many emails over the 30 days, send times, and the
    copy for each. Subject lines. Do all affiliates truly get the identical
    sequence (only the link differs)?

16. **Email verification service** for the video gate (real-time validity check so
    no double opt-in is needed). Any preference / existing account? (e.g.
    ZeroBounce, Kickbox, NeverBounce, Resend's own validation.)

---

## D. Funnel / content

17. **Video host + IDs.** Wistia? The 10-char video IDs for `/trial` and for the
    "Buy Traffic" video. Confirmed timestamps 1:53 and 3:35?

18. **Buy Traffic CTA** — what URL does the big button open?

19. **Is there an existing Lovable codebase to reuse?** If yes, invite / repo
    export. If it changes, tell us before we're deep into a hand-built frontend.

20. **All assets:** copy for `/trial`, `/activate`, `/secure-checkout`; images;
    the approved list of live-notification lines; branding (logo, colors, fonts).

---

## E. Product behaviour clarifications

21. **Passwordless free users** — a shared/family computer means one browser =
    one "logged-in" lead. Acceptable? Any session expiry, or truly forever?

22. **Free user who later pays** — they set a password at upgrade. Where in the
    flow (during checkout, or first paid-dashboard visit)?

23. **Email change** requires confirmation from the new address — send a
    confirmation link, revert if not confirmed within N hours?

24. **Admin as fallback affiliate** — the admin profile needs its own
    `affiliate_code`. Which admin account / email?

25. **Reactivation price** — always $47/mo, no trial again, correct?

26. **Multiple paid subscriptions by the same person** — allowed, or one active
    subscription per profile?

---

## F. Accounts / access still needed

- [ ] Explodely — dashboard + API/IPN credentials
- [ ] Supabase — project access
- [ ] Resend — API key + verified domain
- [ ] Namecheap — DNS access
- [ ] Google Workspace — `harley@kash.network`, `support@kash.network` + SMTP creds
- [ ] AI provider — API key
- [ ] Lovable — project/repo (if reusing)
- [ ] Vercel — team/project for deployment
- [ ] Video host — account + IDs
- [ ] Email verification service — account/key
- [ ] **Real image files** — the Lovable frontend design was brought in but its
      images were Lovable-CDN-only. Placeholders are in `apps/web/src/assets/*.asset.json`.
      Need: Harley/founder photo, results screenshots (x2), 3 testimonial photos,
      the yellow-highlighter graphic. Replace each file's `url`.
- [ ] Supabase Postgres connection string (Project Settings → Database → URI)
      for the live `DATABASE_URL`.
