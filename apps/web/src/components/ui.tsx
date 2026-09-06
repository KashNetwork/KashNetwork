import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    ghost: 'bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Card({
  children,
  className = '',
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={`rounded-xl bg-white ring-1 ring-slate-200 ${className}`}>
      {title && (
        <div className="border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-700">
          {title}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
      {...props}
    />
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 text-2xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
    </div>
  );
}

export function Banner({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  const styles =
    tone === 'warn'
      ? 'bg-amber-50 text-amber-800 ring-amber-200'
      : 'bg-brand-50 text-brand-700 ring-brand-100';
  return <div className={`rounded-lg px-4 py-3 text-sm ring-1 ${styles}`}>{children}</div>;
}
