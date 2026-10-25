# Kash Network: handoff guide

How to see and manage everything yourself. Passwords and keys are not in this file; each service below is a login you own.

## 1. Day to day: the admin dashboard

Sign in at **kash.network/login** with the admin account, then open `/app`.

| Tab | What it does |
|---|---|
| Dashboard | Revenue this month, active paid members, free leads, pending payouts, recent activity |
| Customers | Every account. Filter, search by email, **Export CSV**. Per row: **Make paid / Make free** (manual override) and **Move referrer** (put a member under a different affiliate by code) |
| Payouts | Cashout requests. **Approve & mark paid** after you have sent the money, or **Reject** with a reason (the commissions go back to the affiliate). **Export CSV** for batch PayPal / bank payments |
| Support | Every ticket. The assistant "Kash" replies on your behalf |
| Admin | The business rules in force, and **Safeguard flags** (self-referrals, duplicate accounts, chargebacks). Click **Mark reviewed** when you have looked at one |

Every manual change (status override, referrer move, payout decision, flag review) is written to an audit log.

### How money works
- $1 trial, then the monthly price. The affiliate earns **$30 flat** on each recurring payment (nothing on the $1 trial).
- A commission is held **30 days**, then becomes available.
- Cashout minimum **$30**. **You pay affiliates yourself** (PayPal or bank). Explodely does not pay affiliates. Mark the payout paid in the Payouts tab afterwards.
- Refund or chargeback: the related commission is reversed automatically.
- Cashouts freeze while the affiliate's own membership is past due.
- Self-referral: the commission goes to the admin account and a flag is raised.

## 2. Where everything lives

| What | Where | What you use it for |
|---|---|---|
| The website and its logs | **vercel.com**, project `kash-network` | Deployments, **Logs** (errors, IPN calls), **Settings → Environment Variables** (all secrets), Cron |
| The database | **supabase.com**, your project | **Table Editor** to look at data, **SQL Editor** to run queries (examples below) |
| Payments | **Explodely Seller Hub** | Products, Payments, IPN settings and log, refunds, Customise Checkout (product image, form colours) |
| Sending and receiving email | **resend.com** | Emails (delivered / bounced), Domains, Webhooks |
| Mailboxes (support@, harley@) | Namecheap Private Email | Reading mail; forwarding |
| Domain and DNS | **Namecheap** → Domain List → Advanced DNS | Records for the site and email |
| The AI assistant | **aistudio.google.com** | The Gemini key and its usage |
| Email schedule | **cron-job.org** | Calls the site every 15 minutes to send the nurture emails |
| Uptime alerts | **uptimerobot.com** | Pings `/api/health?strict=1` and emails you if it fails |
| The code | **github.com/KashNetwork/KashNetwork** | History of every change |

### Settings (Vercel → Settings → Environment Variables)
`DATABASE_URL`, `RESEND_API_KEY`, `AI_API_KEY`, `EXPLODELY_IPN_SECRET`, `EXPLODELY_PRODUCT_ID`, `CRON_SECRET`, `INBOUND_EMAIL_SECRET`, `UNSUBSCRIBE_SECRET`, `EMAIL_FROM_*`, `SUPPORT_INBOX`. After changing one, redeploy (Deployments → ⋯ → Redeploy) for it to take effect.

## 3. Useful questions to ask the database (Supabase → SQL Editor)

```sql
-- members by type
select account_type, count(*) from profiles where role <> 'admin' group by 1;

-- the last 20 payment notifications from Explodely
select * from payment_events order by created_at desc limit 20;

-- commissions by status (and the dollar total)
select status, count(*), sum(amount_cents) / 100.0 as dollars from commissions group by 1;

-- cashout requests waiting
select p.email, y.amount_cents / 100.0 as dollars, y.requested_at
from payouts y join profiles p on p.id = y.affiliate_id
where y.status = 'requested' order by y.requested_at;

-- open safeguard flags
select type, severity, created_at from fraud_flags where not resolved order by created_at desc;

-- everything an admin changed
select action, target_type, created_at from admin_audit order by created_at desc limit 50;
```

## 4. When something looks wrong

| Problem | Check |
|---|---|
| A buyer paid but the account did not unlock | Vercel → Logs, search `webhooks`. Then Explodely → IPN log for that payment. Then `payment_events` (query above) |
| Nurture emails stopped | cron-job.org history; `https://kash.network/api/health?strict=1` should say ok |
| Emails not arriving | Resend → Emails (bounced / suppressed?), then spam folder |
| AI assistant silent | Resend → Webhooks (inbound), Google AI Studio quota |
| Site down | Vercel → Deployments; UptimeRobot sends you an email |

## 5. Putting a change live
From the project folder: `npx vercel deploy --prod --yes` (needs `npx vercel login` once). Then check the site.

## 6. Before you go fully live: cleanup list
- Delete the Explodely **review account** once Explodely approves, and any test leads (Customers tab, or SQL).
- Rotate the secrets that were shared in chat during the build (`CRON_SECRET`, API keys) and update them in Vercel.
- Switch the Kickbox key from sandbox to live (`EMAIL_VERIFY_API_KEY`) if you want real email verification.
