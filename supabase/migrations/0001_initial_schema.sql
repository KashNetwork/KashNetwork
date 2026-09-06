-- Kash Network — initial schema
-- See docs/ARCHITECTURE.md for the model this implements.

create extension if not exists citext;
-- gen_random_uuid() is core in Postgres 13+ (no pgcrypto needed)

-- ---------------------------------------------------------------------------
-- enums
-- ---------------------------------------------------------------------------
create type account_type       as enum ('free', 'paid');
create type free_variant       as enum ('lead', 'downgraded');
create type user_role          as enum ('user', 'admin');

create type subscription_state as enum
  ('trialing', 'active', 'past_due', 'cancelling', 'cancelled', 'expired');

create type payment_event_type as enum
  ('trial_started', 'subscription_activated', 'rebill_succeeded', 'rebill_failed',
   'refunded', 'chargeback', 'cancel_requested', 'subscription_cancelled', 'reactivated');

create type click_link_kind    as enum ('landing', 'sales', 'checkout');
create type referral_status    as enum ('trial', 'active', 'cancelled', 'refunded');
create type commission_kind    as enum ('trial', 'recurring');
create type commission_status  as enum
  ('pending', 'available', 'requested', 'paid', 'reversed', 'rejected');
create type payout_status      as enum ('requested', 'approved', 'paid', 'rejected');
create type payout_method      as enum ('paypal', 'cashapp', 'bank', 'other');
create type sequence_status    as enum ('active', 'converted', 'completed', 'stopped');
create type email_direction    as enum ('outbound', 'inbound');
create type fraud_flag_type    as enum
  ('self_referral', 'dup_account', 'velocity', 'disposable_email',
   'ip_match', 'payment_fingerprint', 'attribution_conflict');

-- ---------------------------------------------------------------------------
-- shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles — one row per human.
-- Auth is custom (see docs/ARCHITECTURE.md §4): own sessions + password hashing,
-- not Supabase Auth. Leads have no password; paid users set one on upgrade.
-- The frontend never talks to Postgres directly — always via the API. RLS is
-- enabled everywhere with no policies (default deny) as defense-in-depth; the
-- API connection is the enforcement point.
-- ---------------------------------------------------------------------------
create table profiles (
  id                       uuid primary key default gen_random_uuid(),
  email                    citext not null unique,
  full_name                text,
  password_hash            text,                 -- null for leads
  role                     user_role     not null default 'user',
  account_type             account_type  not null default 'free',
  free_variant             free_variant  not null default 'lead',

  is_affiliate             boolean not null default false,
  affiliate_code           text unique,          -- set when first becomes paid
  referred_by_affiliate_id uuid references profiles(id),  -- tentative attribution
  admin_reassigned         boolean not null default false, -- downline moved to admin

  signup_ip                inet,
  signup_user_agent        text,
  signup_fingerprint       text,
  email_verified_at        timestamptz,

  payout_method            payout_method,
  payout_details           jsonb,                -- { paypal_email } | { cashtag } | { bank... }

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index on profiles (account_type);
create index on profiles (referred_by_affiliate_id);
create trigger t_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- sessions — opaque bearer token (hashed) in the kn_session cookie
-- ---------------------------------------------------------------------------
create type session_kind as enum ('lead', 'user');

create table sessions (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  token_hash   text not null unique,            -- sha-256 of the cookie value
  kind         session_kind not null,
  ip           inet,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null,
  revoked_at   timestamptz
);
create index on sessions (profile_id);
create index on sessions (expires_at) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- email_change_requests — change of profile email needs confirm from new address
-- ---------------------------------------------------------------------------
create table email_change_requests (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  new_email   citext not null,
  token_hash  text not null unique,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  confirmed_at timestamptz
);
create index on email_change_requests (profile_id) where confirmed_at is null;

-- ---------------------------------------------------------------------------
-- visitors + clicks (pre-account attribution)
-- ---------------------------------------------------------------------------
create table visitors (
  id            uuid primary key,               -- kn_vid cookie value
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  ip            inet,
  user_agent    text
);

create table referral_links (
  id           uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references profiles(id) on delete cascade,
  kind         click_link_kind not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (affiliate_id, kind)
);

create table clicks (
  id           uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references profiles(id) on delete cascade,
  link_kind    click_link_kind not null,
  visitor_id   uuid references visitors(id),
  ip           inet,
  user_agent   text,
  referer      text,
  landing_path text,
  created_at   timestamptz not null default now()
);
create index on clicks (visitor_id, created_at desc);
create index on clicks (affiliate_id, created_at desc);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references profiles(id) on delete cascade,
  external_sub_id      text unique,
  external_product_id  text,
  state                subscription_state not null default 'trialing',
  price_cents          integer not null default 100,
  trial_started_at     timestamptz,
  trial_ends_at        timestamptz,
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at         timestamptz,
  reactivated_at       timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index on subscriptions (profile_id);
create index on subscriptions (state);
create index on subscriptions (current_period_end)
  where cancel_at_period_end;
create trigger t_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- payment_events — append-only raw IPN log = audit trail
-- ---------------------------------------------------------------------------
create table payment_events (
  id               uuid primary key default gen_random_uuid(),
  provider         text not null default 'explodely',
  event_type       payment_event_type not null,
  external_txn_id  text,
  external_sub_id  text,
  customer_email   citext,
  amount_cents     integer not null default 0,
  currency         text not null default 'USD',
  affiliate_ref    text,                          -- our passthrough code if returned
  occurred_at      timestamptz not null,
  raw              jsonb not null,
  signature_valid  boolean not null default false,
  dedupe_key       text not null unique,          -- `${txn}:${type}`
  processed_at     timestamptz,
  processing_error text,
  created_at       timestamptz not null default now()
);
create index on payment_events (customer_email, occurred_at desc);
create index on payment_events (external_sub_id);
create index on payment_events (processed_at) where processed_at is null;

-- ---------------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------------
create table referrals (
  id                  uuid primary key default gen_random_uuid(),
  affiliate_id        uuid not null references profiles(id),
  referred_profile_id uuid not null references profiles(id) unique,
  status              referral_status not null default 'trial',
  first_click_at      timestamptz,
  last_click_at       timestamptz,
  attributed_at       timestamptz not null default now(),
  attribution_locked  boolean not null default false,
  attribution_source  text,                        -- 'cookie' | 'explodely' | 'admin_fallback'
  created_at          timestamptz not null default now()
);
create index on referrals (affiliate_id);

-- ---------------------------------------------------------------------------
-- payouts (declared before commissions for the FK)
-- ---------------------------------------------------------------------------
create table payouts (
  id              uuid primary key default gen_random_uuid(),
  affiliate_id    uuid not null references profiles(id),
  amount_cents    integer not null,
  status          payout_status not null default 'requested',
  method          payout_method,
  method_details  jsonb,
  requested_at    timestamptz not null default now(),
  approved_at     timestamptz,
  paid_at         timestamptz,
  rejected_reason text,
  acted_by        uuid references profiles(id),
  created_at      timestamptz not null default now()
);
create index on payouts (affiliate_id);
create index on payouts (status);

-- ---------------------------------------------------------------------------
-- commissions
-- ---------------------------------------------------------------------------
create table commissions (
  id               uuid primary key default gen_random_uuid(),
  affiliate_id     uuid not null references profiles(id),
  referral_id      uuid not null references referrals(id),
  subscription_id  uuid references subscriptions(id),
  payment_event_id uuid references payment_events(id),
  amount_cents     integer not null,
  kind             commission_kind not null default 'recurring',
  status           commission_status not null default 'pending',
  hold_until       timestamptz not null,
  available_at     timestamptz,
  reversed_at      timestamptz,
  reversal_reason  text,
  payout_id        uuid references payouts(id),
  created_at       timestamptz not null default now()
);
create index on commissions (affiliate_id, status);
create index on commissions (payment_event_id);
create index on commissions (status, hold_until);
-- one commission per (referral, payment_event) — makes IPN processing idempotent
create unique index commissions_referral_event_uniq
  on commissions (referral_id, payment_event_id)
  where payment_event_id is not null;

create table payout_items (
  payout_id     uuid not null references payouts(id) on delete cascade,
  commission_id uuid not null references commissions(id) unique,
  primary key (payout_id, commission_id)
);

-- ---------------------------------------------------------------------------
-- email + AI
-- ---------------------------------------------------------------------------
create table lead_state (
  profile_id        uuid primary key references profiles(id) on delete cascade,
  sequence          text not null default 'free_nurture',
  sequence_step     integer not null default 0,
  next_send_at      timestamptz,
  sequence_status   sequence_status not null default 'active',
  email_affiliate_id uuid references profiles(id),  -- whose link goes in the emails
  entered_at        timestamptz not null default now(),
  converted_at      timestamptz,
  updated_at        timestamptz not null default now()
);
create index on lead_state (sequence_status, next_send_at);
create trigger t_lead_state_updated before update on lead_state
  for each row execute function set_updated_at();

create table email_messages (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid references profiles(id) on delete set null,
  direction           email_direction not null,
  from_addr           text not null,
  to_addr             text not null,
  subject             text,
  body_text           text,
  body_html           text,
  sequence_step       integer,
  provider_message_id text,
  in_reply_to         text,
  ai_generated        boolean not null default false,
  created_at          timestamptz not null default now()
);
create index on email_messages (profile_id, created_at desc);

create table ai_threads (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references profiles(id) on delete cascade unique,
  active          boolean not null default true,
  first_reply_at  timestamptz,
  message_count   integer not null default 0,
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notifications (social proof)
-- ---------------------------------------------------------------------------
create table notifications (
  id                 uuid primary key default gen_random_uuid(),
  location           text not null check (location in ('landing', 'sales', 'both')),
  member_label       text not null,
  message            text not null,
  relative_time_text text,
  weight             integer not null default 1,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- fraud, audit, support, settings
-- ---------------------------------------------------------------------------
create table fraud_flags (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references profiles(id) on delete set null,
  type         fraud_flag_type not null,
  severity     text not null default 'medium',
  details      jsonb,
  auto_action  text,
  resolved     boolean not null default false,
  resolved_at  timestamptz,
  resolved_by  uuid references profiles(id),
  created_at   timestamptz not null default now()
);
create index on fraud_flags (resolved, created_at desc);

create table admin_audit (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references profiles(id),
  action      text not null,
  target_type text,
  target_id   uuid,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create table support_tickets (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  from_email text not null,
  subject    text,
  message    text not null,
  status     text not null default 'open',
  created_at timestamptz not null default now()
);

create table app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
insert into app_settings (key, value) values
  ('payout_min_cents',        '5000'),
  ('payout_reserve_percent',  '0'),
  ('commission_hold_days',    '30'),
  ('attribution_window_days', '30'),
  ('ai_monthly_cost_cap_usd', '50');

-- ---------------------------------------------------------------------------
-- RLS — default deny. Auth is custom and the frontend never connects to
-- Postgres directly; every read/write goes through the API using the
-- service-role key (which bypasses RLS). Enabling RLS with no policies means
-- that if the anon/authenticated keys ever leak, they expose nothing.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sessions','email_change_requests','visitors','referral_links',
    'clicks','subscriptions','payment_events','referrals','payouts','commissions',
    'payout_items','lead_state','email_messages','ai_threads','notifications',
    'fraud_flags','admin_audit','support_tickets','app_settings'
  ] loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;
