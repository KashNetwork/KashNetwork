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

export default function Landing({ initialRef }: { initialRef?: string }) {
  const ref = useRefTracking('landing', initialRef);
  const [revealed, setRevealed] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = () =>
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-900 antialiased">
      {/* soft ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[820px]"
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

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <nav className="flex items-center justify-between py-5">
          <span className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ backgroundImage: 'linear-gradient(135deg,#2A7BEA,#17A3B8,#22c55e)' }}
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
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          >
            Log in
          </Link>
        </nav>

        <section className="pt-10 text-center sm:pt-14">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80">
            <span className="flex -space-x-1.5">
              {AVATARS.map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full ring-2 ring-white"
                  style={{ background: c }}
                />
              ))}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              Trusted by members worldwide
            </span>
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
            Need <span className="text-rose-500">Emergency</span> Cash?
            <span className="mt-2 block">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(120deg,#2563eb 0%,#0891b2 45%,#16a34a 100%)' }}
              >
                $37 Per Hour Sending Emails
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
            Watch the 4-minute demo below — see exactly how the done-for-you system works.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollToVideo}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{
                backgroundImage: 'linear-gradient(120deg,#16a34a,#0891b2,#2563eb)',
                boxShadow: '0 18px 40px -16px rgba(8,145,178,0.45)',
              }}
            >
              <Play className="h-4 w-4 fill-current" />
              Watch the Demo
            </button>
            <button
              onClick={scrollToVideo}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              How it works
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div ref={videoRef} className="relative mx-auto mt-12 w-full max-w-3xl scroll-mt-24">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[32px] opacity-40 blur-2xl"
              style={{ backgroundImage: 'linear-gradient(120deg,rgba(37,99,235,0.28),rgba(22,163,74,0.24))' }}
            />
            <div className="rounded-[26px] bg-white p-2 shadow-xl ring-1 ring-slate-200/80">
              <VideoGate src={PLACEHOLDER_VIDEO} ref={ref} onRevealContent={() => setRevealed(true)} />
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              No credit card to watch · $1 to activate · cancel anytime
            </p>
          </div>
        </section>
      </div>

      {/* revealed at 3:35 */}
      <div
        className={`overflow-hidden transition-all duration-700 ${
          revealed ? 'mt-16 max-h-[7000px] opacity-100' : 'max-h-0 opacity-0'
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
