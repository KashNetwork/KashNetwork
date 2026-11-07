'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LiveNotifications } from '@/components/LiveNotifications';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRefTracking } from '@/lib/useRefTracking';

const navy = '#04184E';
const greenBtn = 'linear-gradient(180deg, #79EE3C 0%, #4FD41B 100%)';

/** The new landing page for every affiliate link: confirm button, then the email pop-up. */
export default function Confirm({ initialRef }: { initialRef?: string }) {
  const ref = useRefTracking('landing', initialRef);
  const router = useRouter();
  const { setMe } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // same sign-up call (and the same email verification) the old landing page used
      const { me } = await api.submitLead(email.trim(), ref);
      setMe(me);
      router.push(`/approved${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong — please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
        <h1 className="font-display text-[44px] font-extrabold leading-[1.05] sm:text-[64px]" style={{ color: navy }}>
          Almost Done!
        </h1>
        <p className="mt-4 font-display text-xl font-semibold sm:text-2xl" style={{ color: navy }}>
          Click below to confirm you’re in…
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-7 w-full max-w-[600px] rounded-full px-6 py-4 font-display text-xl font-extrabold transition hover:-translate-y-0.5"
          style={{ background: greenBtn, color: navy, boxShadow: '0 14px 30px -12px rgba(79,212,27,0.6)' }}
        >
          Click To Confirm
        </button>
        <p className="mt-5 text-[15px] text-slate-500">You’re one click away from generating your FIRST paycheck online…</p>
      </main>

      <LiveNotifications location="landing" />

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
        >
          <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="font-display text-2xl font-extrabold" style={{ color: navy }}>
              Enter Your Email To Get Started
            </h2>
            <div className="relative mt-5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                id="confirm-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                inputMode="email"
                aria-label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 text-base outline-none focus:border-[#4FD41B] focus:ring-2 focus:ring-[#4FD41B]/30"
              />
            </div>
            {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full rounded-full px-6 py-3.5 font-display text-lg font-extrabold disabled:opacity-60"
              style={{ background: greenBtn, color: navy }}
            >
              {busy ? 'Activating…' : 'Activate My Commissions'}
            </button>
            <p className="mt-3 text-center text-sm text-slate-500">✦ Your bonuses will be sent to the email above.</p>
          </form>
        </div>
      )}
    </div>
  );
}
