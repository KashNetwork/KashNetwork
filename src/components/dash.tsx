'use client';

import { useState, type ReactNode } from 'react';
import {
  Bell,
  ChevronRight,
  Copy,
  LogOut,
  Mail,
  Menu,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ layout */

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

function KashLogo() {
  return (
    <span className="flex items-center gap-2.5 px-1">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl"
        style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#17A3B8,#22c55e)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M12 2.6 20.1 7v10L12 21.4 3.9 17V7z" />
          <circle cx="12" cy="12" r="3.6" />
        </svg>
      </span>
      <span className="font-display text-[17px] font-extrabold tracking-tight text-slate-900">
        Kash Network
      </span>
    </span>
  );
}

export function Shell({
  nav,
  active,
  onSelect,
  user,
  onLogout,
  title,
  subtitle,
  actions,
  children,
}: {
  nav: NavGroup[];
  active: string;
  onSelect: (key: string) => void;
  user: { name: string | null; email: string; role: string };
  onLogout?: () => void;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between px-4">
        <KashLogo />
        <button
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {nav.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const on = item.key === active;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelect(item.key);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      on
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    <Icon className={cn('h-[18px] w-[18px]', on ? 'text-white' : 'text-slate-400')} />
                    {item.label}
                    {on && <ChevronRight className="ml-auto h-4 w-4 text-white/70" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#22c55e)' }}
          >
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">
              {user.name ?? 'Member'}
            </div>
            <div className="truncate text-xs text-slate-400">{user.email}</div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 lg:block">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-slate-200 shadow-xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Mail className="h-[18px] w-[18px]" />
            </button>
            <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <span
              className="ml-1 grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
              style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#22c55e)' }}
            >
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- primitives */

export function Btn({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-slate-900 text-white hover:bg-slate-800',
        variant === 'outline' &&
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  featured,
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  featured?: boolean;
  trend?: { dir: 'up' | 'down' | 'flat'; text: string };
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 ring-1 transition',
        featured
          ? 'text-white ring-transparent'
          : 'bg-white text-slate-900 ring-slate-200/70 hover:ring-slate-300',
      )}
      style={
        featured
          ? { backgroundImage: 'linear-gradient(135deg,#1466d0 0%,#0e7490 55%,#15803d 100%)' }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <span className={cn('text-sm font-medium', featured ? 'text-white/80' : 'text-slate-500')}>
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              'grid h-8 w-8 place-items-center rounded-lg',
              featured ? 'bg-white/15' : 'bg-slate-100 text-slate-400',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight">{value}</div>
      {(hint || trend) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-0.5 font-semibold',
                featured
                  ? 'bg-white/15 text-white'
                  : trend.dir === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : trend.dir === 'down'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-500',
              )}
            >
              {trend.dir === 'up' ? '↑' : trend.dir === 'down' ? '↓' : '•'} {trend.text}
            </span>
          )}
          {hint && (
            <span className={featured ? 'text-white/70' : 'text-slate-400'}>{hint}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-2xl bg-white ring-1 ring-slate-200/70', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
  soon,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  soon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-slate-400">{hint}</p>}
      {soon && (
        <span className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {soon}
        </span>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    free: 'bg-slate-100 text-slate-600 ring-slate-200',
    cancelled: 'bg-rose-50 text-rose-600 ring-rose-200',
    lead: 'bg-blue-50 text-blue-600 ring-blue-200',
    admin: 'bg-violet-50 text-violet-600 ring-violet-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1',
        map[status] ?? map.free,
      )}
    >
      {status}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100',
        className,
      )}
      {...props}
    />
  );
}

export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'warn' | 'success';
}) {
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 text-sm ring-1',
        tone === 'warn' && 'bg-amber-50 text-amber-800 ring-amber-200',
        tone === 'success' && 'bg-emerald-50 text-emerald-800 ring-emerald-200',
        tone === 'info' && 'bg-blue-50 text-blue-800 ring-blue-200',
      )}
    >
      {children}
    </div>
  );
}

export function CopyRow({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pl-3.5">
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-slate-600">{value}</span>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
