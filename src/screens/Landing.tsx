'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck, Sparkles } from 'lucide-react';
import {
  CheckoutFooter,
  CheckoutGrid,
  GuaranteeBanner,
  VerifiedResults,
} from '@/components/checkout-sections';
import { LiveNotifications } from '@/components/LiveNotifications';
import { VideoGate } from '@/components/VideoGate';
import { useRefTracking } from '@/lib/useRefTracking';

// TODO(client): real Wistia video. Placeholder = Big Buck Bunny 480p (~10 min,
// CORS-open, seekable) so the 1:53 gate and 3:35 reveal have runway. Use the DEV
// skip buttons on the player.
const PLACEHOLDER_VIDEO =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm';

const AVATARS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];

export default function Landing() {
  const ref = useRefTracking('landing');
  const [revealed, setRevealed] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = () =>
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070b16] text-slate-100 antialiased">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px]"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 0%, rgba(59,130,246,0.28), transparent 70%),' +
            'radial-gradient(40% 30% at 85% 5%, rgba(16,185,129,0.20), transparent 70%),' +
            'radial-gradient(45% 35% at 12% 8%, rgba(99,102,241,0.18), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(70% 50% at 50% 0%, #000, transparent 80%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* nav */}
        <nav className="flex items-center justify-between py-5">
          <span className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#17A3B8)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2.6 20.1 7v10L12 21.4 3.9 17V7z" />
                <circle cx="12" cy="12" r="3.6" />
              </svg>
            </span>
            Kash Network
          </span>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-white/15 transition hover:bg-white/5 hover:text-white"
          >
            Log in
          </Link>
        </nav>

        {/* hero */}
        <section className="pt-10 text-center sm:pt-16">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300 ring-1 ring-white/10 backdrop-blur">
            <span className="flex -space-x-1.5">
              {AVATARS.map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full ring-2 ring-[#070b16]"
                  style={{ background: c }}
                />
              ))}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Trusted by members worldwide
            </span>
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Need <span className="text-rose-400">Emergency</span> Cash?
            <span className="mt-2 block">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(120deg,#60a5fa 0%,#22d3ee 45%,#34d399 100%)' }}
              >
                $37 Per Hour Sending Emails
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Watch the 4-minute demo below — see exactly how the done-for-you system works.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollToVideo}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#04122f] shadow-lg transition hover:-translate-y-0.5"
              style={{
                backgroundImage: 'linear-gradient(120deg,#5eead4,#22d3ee,#60a5fa)',
                boxShadow: '0 18px 40px -16px rgba(34,211,238,0.5)',
              }}
            >
              <Play className="h-4 w-4 fill-current" />
              Watch the Demo
            </button>
            <button
              onClick={scrollToVideo}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/10"
            >
              How it works
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* video */}
          <div ref={videoRef} className="relative mx-auto mt-12 w-full max-w-3xl scroll-mt-24">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[32px] opacity-60 blur-2xl"
              style={{ backgroundImage: 'linear-gradient(120deg,rgba(96,165,250,0.35),rgba(52,211,153,0.3))' }}
            />
            <div className="rounded-[26px] bg-white/[0.04] p-2 ring-1 ring-white/10 backdrop-blur">
              <VideoGate src={PLACEHOLDER_VIDEO} ref={ref} onRevealContent={() => setRevealed(true)} />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              No credit card to watch · $1 to activate · cancel anytime
            </p>
          </div>
        </section>
      </div>

      {/* revealed content — transitions from the dark hero into the light checkout */}
      <div
        className={`overflow-hidden transition-all duration-700 ${
          revealed ? 'mt-16 max-h-[7000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="h-24 w-full" style={{ backgroundImage: 'linear-gradient(#070b16,#F4F8FF)' }} />
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
