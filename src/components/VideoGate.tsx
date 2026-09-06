'use client';

import { useEffect, useRef, useState } from 'react';
import { VIDEO_GATE } from '@/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button, Input } from './ui';

/**
 * Gated video player.
 *
 * Currently uses an HTML5 <video>. To move to Wistia, swap:
 *   - the <video> element for the Wistia embed
 *   - the 'timeupdate' listener for `video.bind('timechange', ...)`
 *   - `.pause()` / `.play()` for the Wistia player API equivalents
 * The gating logic (pause at emailGateAt, reveal at contentRevealAt) is unchanged.
 */
export function VideoGate({
  src,
  ref: refCode,
  onRevealContent,
}: {
  src: string;
  ref?: string;
  onRevealContent: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { me, setMe } = useAuth();
  const alreadyLead = Boolean(me);

  const [unlocked, setUnlocked] = useState(alreadyLead);
  const [gateVisible, setGateVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!revealed && v.currentTime >= VIDEO_GATE.contentRevealAt) {
        setRevealed(true);
        onRevealContent();
      }
      if (!unlocked && v.currentTime >= VIDEO_GATE.emailGateAt) {
        v.pause();
        setGateVisible(true);
      }
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [unlocked, revealed, onRevealContent]);

  function seekTo(seconds: number) {
    const v = videoRef.current;
    if (!v) return;
    const go = () => {
      v.currentTime = Math.min(seconds, (v.duration || seconds) - 0.1);
      void v.play();
    };
    if (v.readyState >= 1) go();
    else v.addEventListener('loadedmetadata', go, { once: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { me } = await api.submitLead(email.trim(), refCode);
      setMe(me);
      setUnlocked(true);
      setGateVisible(false);
      void videoRef.current?.play();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong — please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-slate-200">
      <video
        ref={videoRef}
        src={src}
        controls={!gateVisible}
        playsInline
        className="aspect-video w-full"
      />

      {gateVisible && !unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
          <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-6 text-center">
            <h3 className="text-lg font-bold text-foreground">Want to see what happened next?</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Enter your email to continue watching and unlock your demo account…
            </p>
            <Input
              type="email"
              required
              autoFocus
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-4"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting} className="mt-4 w-full">
              {submitting ? 'Checking…' : 'CONTINUE →'}
            </Button>
          </form>
        </div>
      )}

      {process.env.NODE_ENV !== 'production' && !unlocked && (
        <div className="absolute right-2 top-2 flex gap-1 rounded bg-white/90 p-1 text-xs shadow">
          <span className="px-1 text-slate-400">dev:</span>
          <button
            className="rounded bg-slate-200 px-1.5 hover:bg-slate-300"
            onClick={() => seekTo(VIDEO_GATE.emailGateAt - 3)}
          >
            skip to gate
          </button>
        </div>
      )}
      {process.env.NODE_ENV !== 'production' && unlocked && !revealed && (
        <div className="absolute right-2 top-2 flex gap-1 rounded bg-white/90 p-1 text-xs shadow">
          <span className="px-1 text-slate-400">dev:</span>
          <button
            className="rounded bg-slate-200 px-1.5 hover:bg-slate-300"
            onClick={() => seekTo(VIDEO_GATE.contentRevealAt - 3)}
          >
            skip to reveal
          </button>
        </div>
      )}
    </div>
  );
}