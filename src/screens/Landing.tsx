'use client';

import { useState } from 'react';
import {
  CheckoutFooter,
  CheckoutGrid,
  GuaranteeBanner,
  VerifiedResults,
} from '@/components/checkout-sections';
import { LiveNotifications } from '@/components/LiveNotifications';
import { YellowSmear } from '@/components/text-accents';
import { VideoGate } from '@/components/VideoGate';
import { useRefTracking } from '@/lib/useRefTracking';

// TODO(client): real Wistia video. Placeholder = Big Buck Bunny 480p (~10 min).
const PLACEHOLDER_VIDEO =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm';

const INK = '#04184E';

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

      <div className="relative mx-auto w-full max-w-5xl px-3 sm:px-6">
        <section className="mx-auto flex min-h-[100svh] flex-col items-center justify-start pb-24 pt-[8vh] text-center sm:min-h-0 sm:justify-center sm:pb-16 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80 sm:text-sm">
            <span className="text-cyan-500">✦</span>
            Trusted by members worldwide
          </div>

          <h1 className="mt-6 font-display font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:mt-7">
            <span
              className="block whitespace-nowrap"
              style={{ fontSize: 'clamp(23px, 6.4vw, 46px)', color: INK, letterSpacing: '-0.01em' }}
            >
              ⚠️ Need <span style={{ color: '#E5162B' }}>Emergency</span> Cash? ⚠️
            </span>
            <span
              className="mt-3 block whitespace-nowrap"
              style={{ fontSize: 'clamp(18px, 6.6vw, 58px)', letterSpacing: '-0.02em', color: INK }}
            >
              <YellowSmear>$30 Per Hour</YellowSmear> Sending Emails
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[14px] font-semibold text-slate-600 sm:max-w-none sm:text-lg lg:whitespace-nowrap">
            Watch the 4-minute demo below to see exactly how this done-for-you system works.
          </p>

          <div className="relative mx-auto mt-8 w-full max-w-3xl sm:mt-9">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[32px] opacity-40 blur-2xl"
              style={{
                backgroundImage: 'linear-gradient(120deg,rgba(37,99,235,0.28),rgba(22,163,74,0.24))',
              }}
            />
            <div className="rounded-[22px] bg-white p-1.5 shadow-xl ring-1 ring-slate-200/80 sm:rounded-[26px] sm:p-2">
              <VideoGate src={PLACEHOLDER_VIDEO} ref={ref} onRevealContent={() => setRevealed(true)} />
            </div>
          </div>
        </section>
      </div>

      {/* revealed at 3:35 — tighter gap on mobile/tablet, original spacing on desktop */}
      <div
        className={`overflow-hidden transition-all duration-700 ${
          revealed ? 'mt-4 sm:mt-6 lg:mt-14 max-h-[7000px] opacity-100' : 'max-h-0 opacity-0'
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
