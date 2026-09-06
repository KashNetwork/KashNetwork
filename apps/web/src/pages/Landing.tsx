import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  CheckoutGrid,
  VerifiedResults,
  GuaranteeBanner,
  CheckoutFooter,
} from '@/components/checkout-sections';
import { RedUnderline, YellowSmear } from '@/components/text-accents';
import { LiveNotifications } from '@/components/LiveNotifications';
import { VideoGate } from '@/components/VideoGate';
import { useRefTracking } from '@/lib/useRefTracking';

// TODO(client): real Wistia video. Placeholder = Big Buck Bunny 480p (~10 min,
// CORS-open, seekable) so the 1:53 gate and 3:35 reveal have runway. Use the DEV
// skip buttons on the player.
const PLACEHOLDER_VIDEO =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm';

const ink = '#0B1220';
const tintBg = '#F4F8FF';

export default function Landing() {
  const ref = useRefTracking('landing');
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="min-h-screen antialiased" style={{ background: tintBg, color: ink }}>
      <div
        className="mx-auto w-full max-w-[1200px]"
        style={{
          background:
            'linear-gradient(180deg, #F4F8FF 0%, #F5F9FF 18%, #F7FBFF 32%, #FCFDFF 45%, #FFFFFF 58%, #FFFFFF 100%)',
        }}
      >
        <section className="mx-auto max-w-[1180px] px-4 pt-10 text-center sm:px-5 sm:pt-16">
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:mt-6 sm:px-6 sm:py-3"
            style={{ boxShadow: '0 10px 26px -18px rgba(11,42,107,0.45)' }}
          >
            <Sparkles className="h-[18px] w-[18px] shrink-0" style={{ color: '#2684FF' }} />
            <span
              className="font-display text-[14px] font-bold sm:text-[16px]"
              style={{ color: '#04184E' }}
            >
              Trusted by members worldwide
            </span>
          </div>

          <h1
            className="mt-6 font-display font-extrabold sm:mt-8"
            style={{
              color: '#04184E',
              fontSize: 'clamp(26px, 5.6vw, 52px)',
              lineHeight: '1.12',
              letterSpacing: '-0.03em',
            }}
          >
            <span className="block whitespace-nowrap" style={{ fontSize: 'clamp(22px, 6.9vw, 52px)' }}>
              ⚠️ Need <span style={{ color: '#E5162B' }}>Emergency</span> Cash? ⚠️
            </span>
            <span
              className="mt-3 block font-display font-extrabold"
              style={{ fontSize: 'clamp(29px, 7.3vw, 68px)', letterSpacing: '-0.03em' }}
            >
              <YellowSmear>$37 Per Hour Sending Emails</YellowSmear>
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-[840px] font-display text-[16px] font-semibold leading-[25px] sm:mt-6 sm:text-[19px] sm:leading-[29px] md:whitespace-nowrap lg:text-[22px] lg:leading-[32px]"
            style={{ color: '#04184E' }}
          >
            <RedUnderline>
              <span className="font-extrabold">LIVE DEMO:</span>
            </RedUnderline>{' '}
            Click ▶️ “PLAY” to watch the 4-minute video below — see how it works…
          </p>

          <div className="mx-auto mt-7 w-full sm:mt-9" style={{ maxWidth: 800 }}>
            <VideoGate
              src={PLACEHOLDER_VIDEO}
              ref={ref}
              onRevealContent={() => setRevealed(true)}
            />
          </div>
        </section>

        <div
          className={`overflow-hidden transition-all duration-700 ${
            revealed ? 'max-h-[6000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
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

      <LiveNotifications location="landing" />
    </div>
  );
}
