'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckoutFooter } from '@/components/checkout-sections';
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

      <CheckoutFooter variant="plain" />
      <LiveNotifications location="landing" />

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && !busy && setOpen(false)}
        >
          <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="font-display text-2xl font-extrabold" style={{ color: navy }}>
              Where should we send your access?
            </h2>
            <label htmlFor="confirm-email" className="mt-5 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="confirm-email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-[#4FD41B] focus:ring-2 focus:ring-[#4FD41B]/30"
            />
            {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full rounded-full px-6 py-3.5 font-display text-lg font-extrabold disabled:opacity-60"
              style={{ background: greenBtn, color: navy }}
            >
              {busy ? 'Confirming…' : 'Confirm My Spot'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
