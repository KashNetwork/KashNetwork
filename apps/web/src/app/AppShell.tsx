import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '../components/ui';
import { useAuth } from '../lib/auth';
import { PANELS, TAB_LABELS, type TabKey } from './panels';

export function AppShell() {
  const { me, loading, logout } = useAuth();
  const [active, setActive] = useState<TabKey | null>(null);

  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/login" replace />;

  const tabs = me.tabs as TabKey[];
  const current: TabKey = active && tabs.includes(active) ? active : tabs[0]!;
  const Panel = PANELS[current];
  const showLogout = me.accountType === 'paid' || me.role === 'admin';

  return (
    <div className="min-h-screen lg:flex">
      {/* sidebar (desktop) / topbar (mobile) */}
      <aside className="border-b border-slate-200 bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm font-extrabold uppercase tracking-widest text-brand-600">
            Kash
          </span>
          {showLogout && (
            <button onClick={() => void logout()} className="text-xs text-slate-500 hover:text-ink">
              Log out
            </button>
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                t === current
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-5 text-lg font-bold text-ink">{TAB_LABELS[current]}</h1>
          <Panel />
        </div>
      </main>
    </div>
  );
}
