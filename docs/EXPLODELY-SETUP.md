# Explodely setup

Source: https://docs.explodely.com (public). API key in hand; **still need the
Explodely account username** and the **product ID** (created below).

## How it maps to our code

| Explodely | Ours |
|---|---|
| Payment link `https://explodely.com/p/{PRODUCT_ID}` | `/api/checkout/start` redirects here |
| `?tpa=CODE` on the link | our affiliate code — comes back as `affiliate=tpa_CODE` on the IPN; also zeroes Explodely's own commission (we run our own affiliate system) |
| Sale IPN, no `rebill` | `trial_started` → account becomes paid+affiliate |
| Sale IPN, `rebill=yes` + `mainorderid` | `rebill_succeeded` → $30 commission |
| Refund IPN (negative `amount`) | `refunded` → reverse commissions |
| Rebill Cancel IPN (`mainorderid` only) | `subscription_cancelled` → downgrade |
| initial sale `orderid` (= `mainorderid` later) | `subscriptions.external_sub_id` |
| IPN auth | none from Explodely — we append `?token=<EXPLODELY_IPN_SECRET>` and check it |
| API `https://explodely.com/api/v1/rebill` (`apiaction=cancelrebill`) | user-initiated cancel calls this |

Declines (`rebill_failed`) and chargebacks are **Webhooks-only**, not IPN — the
cron backstop handles lapsed subscriptions for now.

## Create the product (ADD PRODUCT wizard)

### Step 1 — Product Settings
| Field | Value |
|---|---|
| Funnel | leave blank (or make one called "Kash Network") |
| Product Type | **Digital** (or "Membership" if that's an option — it's a recurring digital product) |
| Product Flow | **Trial** / "Free Trial" / "Paid Trial" — whatever represents *$1 for 7 days then rebill*. If there's no trial flow, pick "Standard" and set the trial in Step 2. |
| Product Name | `Kash Network Membership` |
| Product Description | `Done-for-you affiliate system — dashboard, traffic, and a 24/7 AI assistant.` |
| Sales Page URL | `https://kash.network/activate` (use `https://kash-network.vercel.app/activate` until DNS) |
| Thank You URL | `https://kash.network/app` (where buyers land after paying — we auto-log them in) |
| Content Delivery URL | `https://kash.network/app` |
| Customer Helpdesk URL | `https://kash.network/app` (Support tab) |
| Customer Service Email | `support@app.kash.network` |
| Memo | internal note, anything |

### Step 2 — Price & Affiliate Settings
- **Initial price: $1**, **trial length: 7 days**, then **rebill $47 / month** (monthly, indefinite).
- **Affiliate commission: 0%** — we run our own affiliate system. (If you pass
  `?tpa=` on links Explodely zeroes it automatically, but set it to 0 anyway.)
- Don't enable Explodely's affiliate program / marketplace listing (optional, your call).

### Step 3 — Integration Settings
This is where IPN / webhooks live. Set:
- **IPN URL**: `https://kash-network.vercel.app/api/webhooks/explodely?token=<SECRET>`
  (I'll generate `<SECRET>` and give it to you, or you pick one — it just has to
  match `EXPLODELY_IPN_SECRET` in Vercel.)
- **Send IPN**: Yes
- **IPN Type**: POST
- Leave the separate Refund IPN URL blank (refunds go to the same URL).
- Or use the **Global IPN** under Seller Hub → Developers instead — same URL,
  applies to all products.

### Step 4 — Additional Settings
Defaults are fine. Submit for approval.

## After the product exists — send me

1. **Product ID** (shows in View Products) → `EXPLODELY_PRODUCT_ID`
2. **Explodely account username** → `EXPLODELY_USERNAME` (for API cancel calls +
   sales reconciliation). It's in Account settings.
3. The **payment link** it generated (should be `explodely.com/p/{id}`, just confirm).

Then I set the three env vars + the IPN token in Vercel, run one **test sale**
(`?testmode=yes` + a generated test card from View Products → Actions → Generate
Test Card), confirm the IPN lands and the account flips to paid+affiliate, do a
test refund, and it's live.

## Confirm the money split in writing

Trial $1 → admin $1 / affiliate $0. Rebill $47 → affiliate $30 / admin $17.
