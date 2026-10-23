'use client';

import { useEffect, useState } from 'react';
import { embedSrc, readEmbedMessage } from '@/content/explodely-embed';

/**
 * Explodely's own checkout form (email, cell number, Google Pay, card details…) inside our
 * Checkout page. After a successful payment Explodely tells us, we remove the form and go to
 * the Thank You page, which opens the new paid account.
 */
export function ExplodelyEmbed() {
  const [height, setHeight] = useState(560);
  const [paid, setPaid] = useState(false);
  // Explodely's form always reports its height once it has loaded; silence means it did not show
  const [loaded, setLoaded] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [ref, setRef] = useState<string | undefined>();

  useEffect(() => {
    setRef(new URLSearchParams(window.location.search).get('ref') ?? undefined);
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const action = readEmbedMessage(e.origin, e.data);
      if (action.kind === 'height') {
        setHeight(action.px);
        setLoaded(true);
      }
      if (action.kind === 'success') {
        setPaid(true);
        window.location.href = action.redirectTo;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setGaveUp(true), 8000);
    return () => clearTimeout(t);
  }, [loaded]);

  const hostedHref = `/api/checkout/start${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;

  if (paid) {
    return <p className="py-10 text-center text-sm font-semibold text-slate-600">Payment received. Taking you to your account…</p>;
  }

  if (gaveUp && !loaded) {
    return (
      <div className="space-y-4 py-4 text-center">
        <p className="text-sm font-semibold text-slate-600">Continue to Explodely's secure payment page to finish your order.</p>
        <a
          href={hostedHref}
          className="block w-full rounded-full px-6 py-5 font-display text-[17px] font-extrabold uppercase text-[#04184E] no-underline"
          style={{ background: 'linear-gradient(180deg, #79EE3C 0%, #4FD41B 100%)' }}
        >
          Continue to secure payment →
        </a>
      </div>
    );
  }

  return (
    <div>
      <iframe
        title="Secure payment"
        src={embedSrc(ref)}
        style={{ width: '100%', border: 0, display: 'block', height }}
        loading="lazy"
      />
      <p className="mt-3 text-center text-xs text-slate-500">
        Form not loading?{' '}
        <a href={hostedHref} className="underline">
          Pay on Explodely's secure page instead
        </a>
        .
      </p>
    </div>
  );
}
