'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

/**
 * Plain (ungated) VSL player — same look and preview/freeze behavior as
 * VideoGate, minus the email-capture mechanics. Used on the Sales page,
 * where the video is just "watch the demo," not a lead-capture gate.
 *
 * Before the first play, a short muted clip (`previewSrc`) loops as the
 * thumbnail. Once the video ends, it freezes on its last frame instead of
 * resetting or getting covered by a replay button — the VSL's closing frame
 * is itself a call-to-action graphic.
 */
export function VslPlayer({ src, previewSrc }: { src: string; previewSrc?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setEnded(true);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
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

  return (
    <div
      ref={wrapRef}
      className="group relative w-full overflow-hidden rounded-[20px] bg-black"
      style={{ maxWidth: 802, aspectRatio: '802 / 451' }}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onClick={togglePlay}
        className="h-full w-full object-cover"
      />

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

      {!playing && !ended && (
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

      {/* same rule as the Landing player: controls only show while paused, and
          never over the closing frame */}
      {!playing && !ended && (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 py-2.5">
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
    </div>
  );
}
