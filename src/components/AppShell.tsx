'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CircleDollarSign,
  LayoutDashboard,
  LifeBuoy,
  Rocket,
  Settings,
  ShieldOff,
  UserCircle,
  Users,
  Wallet,
} from 'lucide-react';
import { Shell, type NavGroup } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { PANELS, type TabKey } from './panels';

const META: Record<TabKey, { label: string; title: string; subtitle: string; icon: typeof Users }> = {
  harleys_story: { label: "Harley's Story", title: "Harley's Story", subtitle: '', icon: BookOpen },
  dashboard: {
    label: 'Dashboard',
    title: 'Dashboard',
    subtitle: 'Your affiliate performance at a glance.',
    icon: LayoutDashboard,
  },
  commissions: {
    label: 'Commissions',
    title: 'Commissions',
    subtitle: 'Wallet, pending balance, cashouts and your own transactions.',
    icon: CircleDollarSign,
  },
  buy_traffic: {
    label: 'Buy Traffic',
    title: 'Buy Traffic',
    subtitle: 'Get started sending visitors to your referral link.',
    icon: Rocket,
  },
  support: {
    label: 'Support',
    title: 'Support',
    subtitle: 'Send a message to the Kash Network team.',
    icon: LifeBuoy,
  },
  profile: {
    label: 'Profile',
    title: 'Profile',
    subtitle: 'Manage your account details and password.',
    icon: UserCircle,
  },
  cancel_subscription: {
    label: 'Cancel Subscription',
    title: 'Cancel Subscription',
    subtitle: 'Manage or cancel your paid membership.',
    icon: ShieldOff,
  },
  customers: {
    label: 'Customers',
    title: 'Customers & Affiliates',
    subtitle: 'Every free lead, paid member and affiliate.',
    icon: Users,
  },
  payouts: {
    label: 'Payouts',
    title: 'Payouts',
    subtitle: 'Affiliate cashout requests and approvals.',
    icon: Wallet,
  },
  admin: {
    label: 'Admin',
    title: 'Admin Settings',
    subtitle: 'System configuration and safeguards.',
    icon: Settings,
  },
};

function navFor(role: string, accountType: string, tabs: TabKey[]): NavGroup[] {
  const has = (k: TabKey) => tabs.includes(k);
  const item = (k: TabKey) => ({ key: k, label: META[k].label, icon: META[k].icon });

  if (role === 'admin') {
    return [
      { label: 'Overview', items: [item('dashboard')] },
      {
        label: 'Manage',
        items: [item('customers'), item('payouts'), item('support')],
      },
      { label: 'Account', items: [item('profile'), item('admin')] },
    ].filter((g) => g.items.length);
  }
  if (accountType === 'paid') {
    return [
      { label: 'Overview', items: [item('dashboard'), item('commissions')] },
      { label: 'Grow', items: [item('buy_traffic')] },
      {
        label: 'Account',
        items: [item('support'), item('profile'), item('cancel_subscription')],
      },
    ];
  }
  return [{ label: 'Menu', items: tabs.map(item) }].filter((g) => g.items.length && has(g.items[0]!.key as TabKey));
}

export function AppShell() {
  const { me, loading, logout } = useAuth();
  const router = useRouter();
  const { refresh } = useAuth();
  const [active, setActive] = useState<TabKey | null>(null);
  // set by the page Explodely sends buyers to after payment (/thanks → /app?welcome=purchase)
  const [justPurchased, setJustPurchased] = useState(false);
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  useEffect(() => {
    if (!loading && !me) router.replace('/login');
  }, [loading, me, router]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('welcome') === 'purchase') setJustPurchased(true);
  }, []);

  // payment confirmations reach us a moment after the buyer lands here: keep checking until the account is paid
  const stillFree = justPurchased && me?.accountType === 'free';
  useEffect(() => {
    if (!stillFree) return;
    const poll = setInterval(() => void refresh(), 2000);
    const giveUp = setTimeout(() => setWaitedTooLong(true), 90_000);
    return () => {
      clearInterval(poll);
      clearTimeout(giveUp);
    };
  }, [stillFree, refresh]);

  // as soon as it is paid, open the new Buy Traffic tab and tidy the address bar
  const paidNow = justPurchased && me?.accountType === 'paid';
  useEffect(() => {
    if (!paidNow) return;
    setActive('buy_traffic');
    setJustPurchased(false);
    window.history.replaceState(null, '', '/app');
  }, [paidNow]);

  if (loading || !me) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eceef2]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (stillFree) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eceef2] px-4 text-center">
        <div className="max-w-sm">
          {!waitedTooLong && (
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          )}
          <h1 className="mt-5 text-xl font-extrabold text-slate-900">
            {waitedTooLong ? 'Still confirming your payment' : 'Payment received, unlocking your account…'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {waitedTooLong
              ? "This is taking longer than usual. Refresh in a minute, or check your email for your sign-in link."
              : 'This only takes a few seconds. You will land on your Buy Traffic tab.'}
          </p>
          {waitedTooLong && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = me.tabs as TabKey[];
  const current: TabKey = active && tabs.includes(active) ? active : tabs[0]!;
  const Panel = PANELS[current];

  // free users only ever see Harley's Story — no dashboard chrome, just the page
  if (tabs.length === 1 && tabs[0] === 'harleys_story') {
    return <Panel />;
  }

  const meta = META[current];
  return (
    <Shell
      nav={navFor(me.role, me.accountType, tabs)}
      active={current}
      onSelect={(k) => setActive(k as TabKey)}
      user={{ name: me.fullName, email: me.email, role: me.role }}
      onLogout={() => void logout()}
      title={meta.title}
      subtitle={meta.subtitle || undefined}
    >
      <Panel />
    </Shell>
  );
}
