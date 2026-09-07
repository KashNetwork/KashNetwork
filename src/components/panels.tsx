'use client';

import { useEffect, useState, type ComponentType } from 'react';
import {
  ArrowRight,
  Banknote,
  CircleDollarSign,
  Clock,
  History,
  Link2,
  MousePointerClick,
  Receipt,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import SalesPage from '@/screens/SalesPage';
import {
  api,
  ApiError,
  money,
  type AdminUserRow,
  type AffiliateStats,
  type SubscriptionSummary,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  Btn,
  CopyRow,
  EmptyState,
  Field,
  Input,
  Notice,
  Panel,
  StatCard,
  StatusPill,
} from '@/components/dash';
import { cn } from '@/lib/utils';

export type TabKey =
  | 'harleys_story'
  | 'dashboard'
  | 'commissions'
  | 'buy_traffic'
  | 'support'
  | 'profile'
  | 'cancel_subscription'
  | 'customers'
  | 'payouts'
  | 'admin';

const SOON_M2 = 'Live in Milestone 2';
const SOON_M3 = 'Live in Milestone 3';
const SOON_M4 = 'Live in Milestone 4';

/* --------------------------------------------------- Harley's Story (free) */

function HarleysStory() {
  const { me } = useAuth();
  if (me?.freeVariant === 'downgraded') {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eceef2] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200/70">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#22c55e)' }}
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold text-slate-900">
            Reactivate your membership
          </h2>
          <p className="mx-auto mt-2 text-sm text-slate-500">
            Your paid membership has ended. Reactivate for $47/month to get your dashboard and
            affiliate link back.
          </p>
          <Btn className="mt-5 w-full" disabled>
            Reactivate for $47/month
          </Btn>
          <p className="mt-2 text-xs text-slate-400">{SOON_M2}</p>
        </div>
      </div>
    );
  }
  return <SalesPage />;
}

/* ------------------------------------------------------ affiliate dashboard */

const STATUS_TONE: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50',
  available: 'text-emerald-600 bg-emerald-50',
  requested: 'text-blue-600 bg-blue-50',
  paid: 'text-emerald-700 bg-emerald-100',
  reversed: 'text-rose-600 bg-rose-50',
  rejected: 'text-slate-500 bg-slate-100',
  trial: 'text-blue-600 bg-blue-50',
  active: 'text-emerald-600 bg-emerald-50',
  cancelled: 'text-rose-600 bg-rose-50',
  refunded: 'text-rose-600 bg-rose-50',
};
const tag = (s: string) => (
  <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-semibold capitalize', STATUS_TONE[s] ?? 'bg-slate-100 text-slate-500')}>
    {s}
  </span>
);
const shortDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

function DashboardPanel() {
  const { me } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.dashboard>> | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (me?.role === 'admin') return;
    api.dashboard().then(setData).catch(() => setErr(true));
  }, [me?.role]);

  if (me?.role === 'admin') return <AdminDashboard />;

  const s: AffiliateStats | undefined = data?.stats;
  const v = (n: number | undefined) => (n === undefined ? '—' : n.toLocaleString());
  const m = (n: number | undefined) => (n === undefined ? '—' : money(n));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total clicks" value={v(s?.totalClicks)} icon={MousePointerClick} featured hint="on your link" />
        <StatCard label="Total referrals" value={v(s?.totalReferrals)} icon={Users} hint="people you brought in" />
        <StatCard label="Total commissions" value={m(s?.totalCommissionsCents)} icon={CircleDollarSign} hint="all time" />
        <StatCard label="Pending" value={m(s?.pendingCents)} icon={Clock} hint="in 30-day hold" />
      </div>

      <Panel title="Your referral link">
        {me?.affiliate ? (
          <div className="space-y-2">
            <CopyRow value={me.affiliate.links.landing} />
            <p className="text-xs text-slate-400">
              Share this link. It points to the landing page and tracks for 30 days (last click wins).
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Your affiliate link activates once your paid account is active.
          </p>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent referrals" bodyClassName={data?.recentReferrals.length ? 'p-0' : 'p-0'}>
          {data && data.recentReferrals.length > 0 ? (
            <ul className="divide-y divide-slate-50">
              {data.recentReferrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm sm:px-6">
                  <span className="font-mono text-xs text-slate-600">{r.email}</span>
                  <span className="flex items-center gap-2">
                    {tag(r.status)}
                    <span className="text-xs text-slate-400">{shortDate(r.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Users} title="No referrals yet" hint="People who sign up through your link appear here." />
          )}
        </Panel>
        <Panel title="Commission history" bodyClassName="p-0">
          {data && data.commissionHistory.length > 0 ? (
            <ul className="divide-y divide-slate-50">
              {data.commissionHistory.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm sm:px-6">
                  <span className="font-semibold text-slate-800">{money(c.amountCents)}</span>
                  <span className="flex items-center gap-2">
                    {tag(c.status)}
                    <span className="text-xs text-slate-400">{shortDate(c.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={History} title="No commissions yet" hint="You earn $30 on every $47 renewal from your referrals." />
          )}
        </Panel>
      </div>
      {err && <p className="text-xs text-rose-500">Couldn't load live stats.</p>}
    </div>
  );
}

function CommissionsPanel() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.commissions>> | null>(null);
  useEffect(() => {
    api.commissions().then(setData).catch(() => undefined);
  }, []);
  const m = (n: number | undefined) => (n === undefined ? '—' : money(n));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Wallet" value={m(data?.walletCents)} icon={Wallet} featured hint="available to withdraw" />
        <StatCard label="Pending" value={m(data?.pendingCents)} icon={Clock} hint="30-day hold" />
        <StatCard label="This month" value={m(data?.thisMonthCents)} icon={CircleDollarSign} hint="commissions earned" />
      </div>

      <Panel
        title="Cashouts"
        action={
          <Btn variant="outline" disabled className="!py-1.5 !text-xs">
            Request cashout
          </Btn>
        }
        bodyClassName="p-0"
      >
        <EmptyState
          icon={Banknote}
          title="No cashout history"
          hint="Request a payout once you have an available balance. Admin approves manually."
          soon={SOON_M3}
        />
      </Panel>

      <Panel title="Transactions" bodyClassName="p-0">
        {data && data.transactions.length > 0 ? (
          <ul className="divide-y divide-slate-50">
            {data.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3 text-sm sm:px-6">
                <span className="text-slate-700">{t.type} payment</span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">{money(t.amountCents)}</span>
                  <span className="text-xs text-slate-400">{shortDate(t.date)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            hint="Your own $1 trial and $47 monthly payments show here, not your referrals'."
          />
        )}
      </Panel>
    </div>
  );
}

function BuyTrafficPanel() {
  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#1466d0,#15803d)' }}
          >
            <Rocket className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900">
              GET STARTED
            </h2>
            <p className="text-sm text-slate-500">Watch this, then click through to the traffic source.</p>
          </div>
        </div>

        <div className="mt-5 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200">
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {/* TODO(client): embedded Buy Traffic video */}
            Video — pending client
          </div>
        </div>

        <a
          href="https://example.com/traffic"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
        >
          {/* TODO(client): real Buy Traffic destination URL */}
          Open the traffic source
          <ArrowRight className="h-4 w-4" />
        </a>
      </Panel>
    </div>
  );
}

function SupportPanel() {
  const { me } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState('sending');
    try {
      await api.submitSupport(message.trim(), subject.trim() || undefined);
      setState('sent');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send.');
      setState('idle');
    }
  }

  return (
    <Panel title="Contact support" className="max-w-2xl">
      {state === 'sent' && <Notice tone="success">Message sent — the team will get back to you by email.</Notice>}
      <form onSubmit={submit} className={cn('space-y-4', state === 'sent' && 'mt-4')}>
        <Field label="From">
          <Input value={me?.email ?? ''} readOnly className="bg-slate-50 text-slate-500" />
        </Field>
        <Field label="Subject">
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
        </Field>
        <Field label="Message">
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's going on…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          />
        </Field>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Btn type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </Btn>
      </form>
    </Panel>
  );
}

function ProfilePanel() {
  const { me, refresh } = useAuth();
  const [name, setName] = useState(me?.fullName ?? '');
  const [newEmail, setNewEmail] = useState('');
  const [pw, setPw] = useState('');
  const [curPw, setCurPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const wrap = (fn: () => Promise<string>) => async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      setMsg(await fn());
      await refresh();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {msg && <Notice tone="success">{msg}</Notice>}
      {err && <Notice tone="warn">{err}</Notice>}

      <Panel title="Account">
        <form
          onSubmit={wrap(async () => {
            await api.updateName(name.trim());
            return 'Name updated.';
          })}
          className="space-y-4"
        >
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Btn type="submit">Save changes</Btn>
        </form>

        <form
          onSubmit={wrap(async () => {
            const r = await api.requestEmailChange(newEmail.trim());
            setNewEmail('');
            return `Confirmation sent to ${r.pendingEmail}. Changing your email needs confirmation from the new address.`;
          })}
          className="mt-6 space-y-4 border-t border-slate-100 pt-6"
        >
          <Field label="Email" hint={`Current: ${me?.email}`}>
            <Input
              type="email"
              placeholder="new@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Field>
          <Btn type="submit" variant="outline">
            Request email change
          </Btn>
        </form>
      </Panel>

      <Panel title={me?.hasPassword ? 'Update password' : 'Set a password'}>
        <form
          onSubmit={wrap(async () => {
            await api.setPassword(pw, me?.hasPassword ? curPw : undefined);
            setPw('');
            setCurPw('');
            return 'Password updated.';
          })}
          className="space-y-4"
        >
          {me?.hasPassword && (
            <Field label="Current password">
              <Input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} />
            </Field>
          )}
          <Field label="New password" hint="At least 8 characters.">
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
          <Btn type="submit">{me?.hasPassword ? 'Update password' : 'Set password'}</Btn>
        </form>
      </Panel>
    </div>
  );
}

function CancelPanel() {
  const { refresh } = useAuth();
  const [sub, setSub] = useState<SubscriptionSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api.subscription().then((r) => setSub(r.subscription)).catch(() => undefined);
  }, []);

  const act = (fn: () => Promise<{ subscription: SubscriptionSummary }>, done: string) => async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fn();
      setSub(r.subscription);
      setMsg(done);
      await refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const pendingCancel = sub?.cancelAtPeriodEnd;
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Panel className="max-w-2xl">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {pendingCancel ? 'Your subscription is set to cancel' : 'Cancel your subscription?'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {pendingCancel ? (
              <>
                You keep full access {periodEnd ? `until ${periodEnd}` : 'until the end of this billing period'}.
                After that your account becomes free, your affiliate link is removed, and future
                commissions and referrals move to the admin. Change your mind any time before then.
              </>
            ) : (
              <>
                You keep paid access until the end of your current billing period
                {periodEnd ? ` (${periodEnd})` : ''}. After that your account downgrades to free,
                your affiliate link is removed, and future commissions and referrals move to the
                admin. You can undo the cancellation any time before the period ends, or reactivate
                later at $47/month.
              </>
            )}
          </p>
        </div>
      </div>

      {msg && <Notice tone={msg.includes('wrong') || msg.includes('Invalid') ? 'warn' : 'success'}>{msg}</Notice>}

      <div className="mt-5 flex flex-wrap gap-2">
        {pendingCancel ? (
          <Btn onClick={act(api.resumeSubscription, "You're all set, your plan continues.")} disabled={busy}>
            Never mind, keep my plan
          </Btn>
        ) : (
          <Btn
            className="!bg-rose-600 hover:!bg-rose-700"
            onClick={act(api.cancelSubscription, 'Cancellation scheduled. You still have access until your billing date.')}
            disabled={busy || !sub}
          >
            {busy ? 'Working…' : 'Cancel subscription'}
          </Btn>
        )}
      </div>
      {!sub && <p className="mt-3 text-xs text-slate-400">No active subscription on file.</p>}
    </Panel>
  );
}

/* ---------------------------------------------------------------- admin */

function AdminDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminOverview>> | null>(null);
  useEffect(() => {
    api.adminOverview().then(setData).catch(() => undefined);
  }, []);
  const money = (c: number) => `$${(c / 100).toLocaleString()}`;
  const n = (v: number | undefined) => (v === undefined ? '—' : v.toLocaleString());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Admin revenue"
          value={data ? money(data.adminRevenueCents) : '—'}
          icon={CircleDollarSign}
          featured
          hint="estimated, this month"
        />
        <StatCard label="Active paid members" value={n(data?.activePaidMembers)} icon={Users} />
        <StatCard label="Free leads" value={n(data?.freeLeads)} icon={MousePointerClick} />
        <StatCard label="Pending payouts" value={data ? money(data.pendingPayoutsCents) : '—'} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Recent activity" className="lg:col-span-2" bodyClassName="p-0">
          <EmptyState
            icon={History}
            title="Nothing to show yet"
            hint="Signups, upgrades, cancellations and payout requests will stream here."
            soon={SOON_M2}
          />
        </Panel>
        <Panel title="Quick actions" bodyClassName="p-0">
          <EmptyState
            icon={ShieldCheck}
            title="Controls coming"
            hint="Approve payouts, override account status, reassign referrals."
            soon={SOON_M4}
          />
        </Panel>
      </div>
    </div>
  );
}

const FILTERS = [
  { k: 'all', label: 'All' },
  { k: 'free_leads', label: 'Free leads' },
  { k: 'active_paid', label: 'Active paid' },
  { k: 'cancelled', label: 'Cancelled' },
];

function AdminCustomers() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      api
        .adminUsers(filter, 1, q)
        .then((r) => {
          setRows(r.rows);
          setTotal(r.total);
        })
        .catch(() => undefined);
    }, 200);
    return () => clearTimeout(id);
  }, [filter, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              filter === f.k
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto w-full sm:w-64">
          <Input placeholder="Search by email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <Panel bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Affiliate code</th>
                <th className="px-5 py-3 font-semibold">Referrals</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-800">{r.email}</td>
                  <td className="px-5 py-3">
                    <StatusPill
                      status={r.free_variant === 'downgraded' ? 'cancelled' : r.account_type}
                    />
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {r.affiliate_code ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.referral_count}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-400">
                    No matching users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          {total} total · status override & referral reassignment — {SOON_M4}
        </div>
      </Panel>
    </div>
  );
}

function AdminPayouts() {
  return (
    <Panel bodyClassName="p-0">
      <EmptyState
        icon={Banknote}
        title="No cashout requests"
        hint="Affiliate payout requests land here — approve & mark paid, reject, or export CSV for batch payment."
        soon={SOON_M3}
      />
    </Panel>
  );
}

function AdminSettings() {
  const { me } = useAuth();
  return (
    <div className="max-w-2xl space-y-6">
      <Panel title="Signed in as">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#22c55e)' }}
          >
            {(me?.fullName ?? me?.email ?? 'A').charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">{me?.fullName ?? 'Admin'}</div>
            <div className="text-xs text-slate-400">{me?.email}</div>
          </div>
          <span className="ml-auto">
            <StatusPill status="admin" />
          </span>
        </div>
      </Panel>

      <Panel title="System settings" bodyClassName="p-0">
        <EmptyState
          icon={UserCog}
          title="Configuration panel coming"
          hint="Payout minimums & reserves, commission hold window, fraud thresholds, notification content."
          soon={SOON_M4}
        />
      </Panel>

      <Panel title="Safeguards" bodyClassName="p-0">
        <EmptyState
          icon={ShieldCheck}
          title="Fraud & business rules"
          hint="Duplicate accounts, self-referrals, chargeback / refund reversals, attribution conflicts, payout timing."
          soon={SOON_M4}
        />
      </Panel>
    </div>
  );
}

export const PANELS: Record<TabKey, ComponentType> = {
  harleys_story: HarleysStory,
  dashboard: DashboardPanel,
  commissions: CommissionsPanel,
  buy_traffic: BuyTrafficPanel,
  support: SupportPanel,
  profile: ProfilePanel,
  cancel_subscription: CancelPanel,
  customers: AdminCustomers,
  payouts: AdminPayouts,
  admin: AdminSettings,
};

// re-exported for AppShell
export const TAB_LABELS: Record<TabKey, string> = {
  harleys_story: "Harley's Story",
  dashboard: 'Dashboard',
  commissions: 'Commissions',
  buy_traffic: 'Buy Traffic',
  support: 'Support',
  profile: 'Profile',
  cancel_subscription: 'Cancel Subscription',
  customers: 'Customers',
  payouts: 'Payouts',
  admin: 'Admin',
};
