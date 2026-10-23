'use client';

import { useEffect, useState } from 'react';

/**
 * Explodely's "Thank You URL" (set it to https://kash.network/thanks).
 * Because the Checkout page shows Explodely's form inside our page, Explodely may load this page
 * inside that frame, so it breaks out to the whole window and opens the app, where the account
 * unlocks and lands on Buy Traffic. A buyer who has no session on this device is told to use the
 * sign-in link in the welcome email instead.
 */
export default function Thanks() {
  const [needsEmail, setNeedsEmail] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const signedIn = await fetch('/api/me', { credentials: 'include' }).then((r) => r.ok).catch(() => false);
      if (cancelled) return;
      if (!signedIn) {
        setNeedsEmail(true);
        return;
      }
      const target = '/app?welcome=purchase';
      if (window.top && window.top !== window) window.top.location.href = target;
      else window.location.replace(target);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f8ff] px-4 text-center">
      <div className="max-w-sm">
        <h1 className="text-xl font-extrabold text-[#04184E]">Payment received</h1>
        {needsEmail ? (
          <p className="mt-3 text-sm text-slate-600">
            Thank you! We have emailed you a sign-in link at the address you used. Open it on this device to reach your
            new account. It can take a minute to arrive.
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Taking you to your account…</p>
        )}
      </div>
    </main>
  );
}
