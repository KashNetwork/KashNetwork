import { useEffect, useState, type ComponentType } from 'react';
import { Banner, Button, Card, Field, Input, StatCard } from '../components/ui';
import SalesPage from '../pages/SalesPage';
import { api, ApiError, type AdminUserRow } from '../lib/api';
import { useAuth } from '../lib/auth';

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

const M2 = 'Wired to live data in Milestone 2 (payments & affiliate system).';
const M3 = 'Wired in Milestone 3 (payouts, email & AI).';

// --- Harley's Story (free users) ---------------------------------------------
function HarleysStory() {
  const { me } = useAuth();
  if (me?.freeVariant === 'downgraded') {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-bold text-foreground">Reactivate your account</h2>
        <p className="mx-auto mt-2 max-w-prose text-sm text-slate-600">
          Your paid membership has ended. Reactivate for $47/month to regain your
          dashboard and affiliate link.
        </p>
        <Banner tone="warn" >Reactivation checkout is wired in Milestone 2.</Banner>
      </Card>
    );
  }
  return <SalesPage embedded />;
}

// --- Affiliate / admin dashboard -------------------------------------------
function DashboardPanel() {
  const { me } = useAuth();
  if (me?.role === 'admin') return <AdminDashboard />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Clicks" value="0" />
        <StatCard label="Total Referrals" value="0" />
        <StatCard label="Total Commissions" value="$0.00" />
        <StatCard label="Pending" value="$0.00" />
      </div>

      <Card title="Your referral link">
        {me?.affiliate ? (
          <CopyRow value={me.affiliate.links.landing} />
        ) : (
          <p className="text-sm text-slate-500">
            Your affiliate link appears here once your paid account is active.
          </p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent referrals">
          <p className="text-sm text-slate-500">No referrals yet. {M2}</p>
        </Card>
        <Card title="Commission history">
          <p className="text-sm text-slate-500">No commissions yet. {M2}</p>
        </Card>
      </div>
    </div>
  );
}

function CommissionsPanel() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Wallet" value="$0.00" sub="Available to withdraw" />
        <StatCard label="Pending" value="$0.00" sub="30-day hold" />
        <StatCard label="Total earnings" value="$0.00" sub="This month" />
      </div>
      <Card title="Cashouts — withdraw history">
        <p className="text-sm text-slate-500">No cashouts yet. {M3}</p>
      </Card>
      <Card title="Transactions — your account payments">
        <p className="text-sm text-slate-500">
          Your own $1 and $47 payments show here (not your referrals'). {M2}
        </p>
      </Card>
    </div>
  );
}

function BuyTrafficPanel() {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground">GET STARTED</h2>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-slate-200">
        {/* TODO(client): embedded Buy Traffic video */}
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Video placeholder
        </div>
      </div>
      <a href="https://example.com/traffic" target="_blank" rel="noreferrer">
        {/* TODO(client): real Buy Traffic destination URL */}
        <Button className="w-full py-3 text-base sm:w-auto">Open the traffic source →</Button>
      </a>
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
    <Card>
      {state === 'sent' && <Banner>Message sent to support@kash.network. We'll be in touch.</Banner>}
      <form onSubmit={submit} className="mt-2 space-y-4">
        <Field label="From">
          <Input value={me?.email ?? ''} readOnly className="bg-slate-50 text-slate-500" />
        </Field>
        <Field label="Subject">
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Message">
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-border"
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </Card>
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
    <div className="space-y-5">
      {msg && <Banner>{msg}</Banner>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      <Card title="Account">
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
          <Button type="submit">Save changes</Button>
        </form>

        <form
          onSubmit={wrap(async () => {
            const r = await api.requestEmailChange(newEmail.trim());
            setNewEmail('');
            return `Confirmation sent to ${r.pendingEmail}. Changing email requires confirmation from your new address.`;
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
          <Button type="submit" variant="ghost">
            Request email change
          </Button>
        </form>
      </Card>

      <Card title={me?.hasPassword ? 'Update password' : 'Set a password'}>
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
          <Button type="submit">{me?.hasPassword ? 'Update password' : 'Set password'}</Button>
        </form>
      </Card>
    </div>
  );
}

function CancelPanel() {
  return (
    <Card>
      <h2 className="text-base font-semibold text-foreground">Cancel your subscription?</h2>
      <p className="mt-2 text-sm text-slate-600">
        You'll keep paid access until the end of the current billing period. After that your
        account downgrades to free, your affiliate link is removed, and future commissions and
        referrals move to the admin. You can undo the cancellation any time before the period
        ends, or reactivate later at $47/month.
      </p>
      <Banner tone="warn">
        The cancel / undo flow is wired to Explodely in Milestone 2.
      </Banner>
    </Card>
  );
}

// --- Admin ------------------------------------------------------------------
function AdminDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminOverview>> | null>(null);
  useEffect(() => {
    api.adminOverview().then(setData).catch(() => undefined);
  }, []);
  const money = (c: number) => `$${(c / 100).toLocaleString()}`;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Admin revenue" value={data ? money(data.adminRevenueCents) : '—'} sub="est." />
      <StatCard label="Active paid" value={data ? String(data.activePaidMembers) : '—'} />
      <StatCard label="Free leads" value={data ? String(data.freeLeads) : '—'} />
      <StatCard label="Pending payouts" value={data ? money(data.pendingPayoutsCents) : '—'} />
    </div>
  );
}

function AdminCustomers() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      api.adminUsers(filter, 1, q).then((r) => {
        setRows(r.rows);
        setTotal(r.total);
      });
    }, 200);
    return () => clearTimeout(id);
  }, [filter, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'free_leads', 'active_paid', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              filter === f ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
        <Input
          placeholder="Search email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="ml-auto max-w-[220px]"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-2">Email</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Affiliate</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5">{r.email}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      {r.free_variant === 'downgraded' ? 'cancelled' : r.account_type}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-500">{r.affiliate_code ?? '—'}</td>
                  <td className="py-2.5 text-slate-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No matching users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">{total} total · status override & referral reassignment land in Milestone 4</p>
      </Card>
    </div>
  );
}

function AdminPayouts() {
  return (
    <Card title="Cashout requests">
      <p className="text-sm text-slate-500">
        Approval queue, mark-paid, reject, and CSV export. {M3}
      </p>
    </Card>
  );
}

function AdminSettings() {
  const { me } = useAuth();
  return (
    <Card title="Admin">
      <p className="text-sm text-slate-600">Signed in as {me?.email}</p>
      <p className="mt-2 text-sm text-slate-500">
        System settings (payout minimums, reserves, fraud thresholds) land in Milestone 4.
      </p>
    </Card>
  );
}

// --- shared bits -----------------------------------------------------------
function CopyRow({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <Input readOnly value={value} className="bg-slate-50" />
      <Button
        variant="ghost"
        onClick={() => {
          void navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
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
