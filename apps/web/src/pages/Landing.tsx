import { useState } from 'react';
import { LiveNotifications } from '../components/LiveNotifications';
import { VideoGate } from '../components/VideoGate';
import { Button, Card } from '../components/ui';
import { useRefTracking } from '../lib/useRefTracking';

// TODO(client): replace with the real Wistia video when supplied.
// Placeholder = Big Buck Bunny 480p (~10 min, Wikimedia, CORS *, range/seek
// supported) so the 1:53 email gate and 3:35 content reveal have real runway.
// Use the DEV "skip to gate" / "skip to reveal" buttons on the player.
const PLACEHOLDER_VIDEO =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm';

export function Landing() {
  const ref = useRefTracking('landing');
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 text-center">
        <div className="text-sm font-bold uppercase tracking-widest text-brand-600">
          Kash Network
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          The automated system for recurring income
        </h1>
      </header>

      <VideoGate src={PLACEHOLDER_VIDEO} ref={ref} onRevealContent={() => setRevealed(true)} />

      <div
        className={`grid gap-5 overflow-hidden transition-all duration-700 ${
          revealed ? 'mt-8 max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <Card className="text-center">
          <h2 className="text-xl font-bold text-ink">Start your $1 trial</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            7 days for $1, then $47/month. Cancel anytime in one click.
          </p>
          <a href={`/secure-checkout${ref ? `?ref=${ref}` : ''}`}>
            <Button className="mt-4 w-full sm:w-auto">Get instant access for $1 →</Button>
          </a>
        </Card>

        <Card title="What members say">
          {/* TODO(client): real reviews */}
          <ul className="space-y-3 text-sm text-slate-600">
            <li>“Set it up in an afternoon and had my first commission that week.” — placeholder</li>
            <li>“The dashboard does the heavy lifting.” — placeholder</li>
          </ul>
        </Card>
      </div>

      <LiveNotifications location="landing" />
    </div>
  );
}
