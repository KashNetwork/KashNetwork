'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

const navy = '#04184E';
const SEEN_KEY = 'kn_approved_seen';

/** The bridge page: seen once, right after the email is confirmed. Watch Now opens the affiliate's own Sales Page. */
export default function Approved() {
  const router = useRouter();
  const { me, loading } = useAuth();
  const [salesHref, setSalesHref] = useState<string | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    const sales = `/activate${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    if (loading) return;
    // only someone who just confirmed their email gets here
    if (!me) {
      router.replace(`/confirm${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`);
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === me.id;
      localStorage.setItem(SEEN_KEY, me.id);
    } catch {
      /* private mode: just show the page */
    }
    // a second visit goes straight on to the Sales Page
    if (seen) {
      router.replace(sales);
      return;
    }
    setSalesHref(sales);
  }, [loading, me, router]);

  if (!salesHref) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
        <h1 className="font-display text-[38px] font-extrabold leading-[1.08] sm:text-[56px]" style={{ color: navy }}>
          Congratulations! Your Account Has Been Approved…
        </h1>
        <p className="mt-5 max-w-xl font-display text-xl font-medium leading-snug sm:text-2xl" style={{ color: navy }}>
          Watch the video presentation BEFORE our first training session, so we can start off on the same page.
        </p>
        <a
          href={salesHref}
          className="mt-8 w-full max-w-[600px] rounded-full px-6 py-4 font-display text-xl font-extrabold no-underline transition hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(180deg, #79EE3C 0%, #4FD41B 100%)', color: navy, boxShadow: '0 14px 30px -12px rgba(79,212,27,0.6)' }}
        >
          Watch Now
        </a>
      </main>
    </div>
  );
}
