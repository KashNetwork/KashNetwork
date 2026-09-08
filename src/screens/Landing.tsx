'use client';

import { useState } from 'react';
import {
  CheckoutFooter,
  CheckoutGrid,
  GuaranteeBanner,
  VerifiedResults,
} from '@/components/checkout-sections';
import { LiveNotifications } from '@/components/LiveNotifications';
import { VideoGate } from '@/components/VideoGate';
import { useRefTracking } from '@/lib/useRefTracking';

// TODO(client): real Wistia video. Placeholder = Big Buck Bunny 480p (~10 min).
const PLACEHOLDER_VIDEO =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm';

const INK = '#04184E';

/** Dark-blue text with a hand-drawn yellow highlighter behind it. */
function YellowHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap" style={{ color: INK }}>
      <span
        aria-hidden
        className="absolute -inset-x-2 top-[16%] bottom-[16%] -z-0 -rotate-[1.5deg] rounded-[6px]"
        style={{ background: '#FFE24D' }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}

export default function Landing({ initialRef }: { initialRef?: string }) {
  const ref = useRefTracking('landing', initialRef);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-900 antialiased">
      {/* soft ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
        style={{
          background:
            'radial-gradient(55% 40% at 50% 0%, rgba(59,130,246,0.14), transparent 70%),' +
            'radial-gradient(40% 30% at 88% 4%, rgba(16,185,129,0.12), transparent 70%),' +
            'radial-gradient(42% 34% at 10% 6%, rgba(99,102,241,0.10), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(70% 45% at 50% 0%, #000, transparent 80%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6">
        <section className="pb-28 pt-10 text-center sm:pb-16 sm:pt-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
            <span className="text-cyan-500">✦</span>
            Trusted by members worldwide
          </div>

          <h1 className="mx-auto mt-7 font-display font-extrabold leading-[1.1] tracking-tight text-slate-900">
            <span
              className="block whitespace-nowrap"
              style={{ fontSize: 'clamp(24px, 6.6vw, 46px)', color: INK }}
            >
              ⚠️ Need <span style={{ color: '#E5162B' }}>Emergency</span> Cash? ⚠️
            </span>
            <span
              className="mt-3 block whitespace-nowrap"
              style={{ fontSize: 'clamp(22px, 7.2vw, 58px)' }}
            >
              <YellowHighlight>$30 Per Hour Sending Emails</YellowHighlight>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-none text-[15px] font-semibold text-slate-600 sm:text-lg lg:whitespace-nowrap">
            Watch the 4-minute demo below to see exactly how this done-for-you system works.
          </p>

          <div className="relative mx-auto mt-9 w-full max-w-3xl">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[32px] opacity-40 blur-2xl"
              style={{
                backgroundImage: 'linear-gradient(120deg,rgba(37,99,235,0.28),rgba(22,163,74,0.24))',
              }}
            />
            <div className="rounded-[26px] bg-white p-2 shadow-xl ring-1 ring-slate-200/80">
              <VideoGate src={PLACEHOLDER_VIDEO} ref={ref} onRevealContent={() => setRevealed(true)} />
            </div>
          </div>
        </section>
      </div>

      {/* revealed at 3:35 */}
      <div
        className={`overflow-hidden transition-all duration-700 ${
          revealed ? 'mt-14 max-h-[7000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div style={{ background: '#F4F8FF', color: '#0B1220' }}>
          <div className="mx-auto w-full max-w-[1200px]">
            <CheckoutGrid
              ctaLabel="Activate My Commissions for $1"
              title="Start Your 7-Day Trial"
              showPanel={false}
              wide
              showTrialSummary
            />
            <GuaranteeBanner wide />
            <VerifiedResults />
            <CheckoutFooter variant="plain" />
          </div>
        </div>
      </div>

      <LiveNotifications location="landing" />
    </div>
  );
}
