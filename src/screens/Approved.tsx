'use client';

import { useSearchParams } from 'next/navigation';

const navy = '#04184E';

/** The bridge page: open to anyone who has the link, any time. Watch Now opens the affiliate's own Sales Page. */
export default function Approved() {
  const ref = useSearchParams().get('ref');
  const salesHref = `/activate${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;

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
