'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { VIDEO_GATE } from '@/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/**
 * Gated video player with custom controls (no seek bar — viewers can't skip).
 * Keeps play/pause, mute, and fullscreen. Pauses + shows the email gate at
 * VIDEO_GATE.emailGateAt; reveals the page at VIDEO_GATE.contentRevealAt.
 *
 * Before the first play, a short muted clip (`previewSrc`) loops as the
 * thumbnail instead of a static poster. Once the video ends, it freezes on
 * its last frame (no loop, no reset, no play button covering it) — the VSL's
 * closing frame is itself a call-to-action graphic.
 *
 * To move to Wistia: swap the <video> for the embed and the 'timeupdate'
 * listener for the Wistia player API. The gating logic is unchanged.
 */
export function VideoGate({
  src,
  previewSrc,
  ref: refCode,
  onRevealContent,
}: {
  src: string;
  previewSrc?: string;
  ref?: string;
  onRevealContent: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { me, setMe } = useAuth();

  const [unlocked, setUnlocked] = useState(Boolean(me));
  const [gateVisible, setGateVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
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
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setEnded(true);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, [unlocked, revealed, onRevealContent]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || gateVisible) return;
    if (v.paused) {
      if (!started) setStarted(true);
      if (v.ended) {
        v.currentTime = 0;
        setEnded(false);
      }
      void v.play();
    } else {
      v.pause();
    }
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

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
      setError(err instanceof ApiError ? err.message : 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`group relative overflow-hidden rounded-2xl bg-black ring-1 ring-black/5 ${gateVisible ? 'min-h-[340px]' : ''}`}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onClick={togglePlay}
        className="aspect-video w-full"
      />

      {/* looping muted preview clip stands in for a static thumbnail until the
          visitor presses play — autoplay+muted so it can start without a
          user gesture. Swapped out (unmounted) the moment they start it. */}
      {previewSrc && !started && (
        <video
          src={previewSrc}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* center play button when paused (gate not up, video hasn't just
          ended — the VSL's last frame is its own call-to-action graphic and
          shouldn't be covered) */}
      {!playing && !gateVisible && !ended && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center bg-black/25 transition hover:bg-black/30"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-lg sm:h-20 sm:w-20">
            <Play className="ml-1 h-7 w-7 fill-[#04184E] text-[#04184E] sm:h-9 sm:w-9" />
          </span>
        </button>
      )}

      {/* custom control bar — no seek, no timer, no settings menu */}
      {!gateVisible && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 py-2.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={togglePlay}
            className="pointer-events-auto rounded-md p-1.5 text-white hover:bg-white/15"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto rounded-md p-1.5 text-white hover:bg-white/15"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto ml-auto rounded-md p-1.5 text-white hover:bg-white/15"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* email gate — fits inside the video on every screen size. Near-opaque
          backdrop so the paused video frame (hills/sky on the placeholder clip)
          doesn't bleed through in patches behind the card. Generous padding +
          the min-h above on the wrapper keep real breathing room around the
          card instead of it crowding the video's own rounded corners. */}
      {gateVisible && !unlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black/95 p-5 sm:p-6">
          <form
            onSubmit={submit}
            className="w-[94%] max-w-sm rounded-xl bg-white p-4 text-center shadow-2xl lg:max-w-lg lg:p-8"
          >
            {/* compact on mobile + tablet (this is the size that fits inside the
                video there); only real desktop (lg, 1024px+) gets the bigger version */}
            <h3 className="text-base font-bold text-[#04184E] lg:text-2xl">
              Want to see what happened next?
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-slate-600 lg:mt-2 lg:text-base">
              Enter your email to continue watching and unlock your demo account…
            </p>
            {/* hand-rolled (not the shared Input/Button) so the larger desktop sizing
                can't lose a specificity tie against those components' own defaults */}
            <input
              type="email"
              required
              autoFocus
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#2A7BEA] focus:ring-2 focus:ring-blue-100 lg:mt-4 lg:px-4 lg:py-4 lg:text-xl"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 w-full rounded-lg bg-[#2A7BEA] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:mt-3 lg:py-4 lg:text-xl"
            >
              {submitting ? 'Checking…' : 'CONTINUE →'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
