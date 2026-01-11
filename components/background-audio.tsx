'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react';

const PLAYLIST = [
  { id: 'Ann_XMs-gfc', title: 'Macarena (Slowed) | Military Edition', mobileTitle: 'Macarena (Slowed)' },
  { id: 'ojtYXmyLcyI', title: 'Government Hooker' },
];

export function BackgroundAudio() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const createPlayer = () => {
      const YTGlobal = (window as any).YT;
      if (!YTGlobal?.Player || !containerRef.current || playerRef.current) return;

      playerRef.current = new YTGlobal.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: PLAYLIST[0].id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1, // Loop current video if not manually skipped
          playlist: PLAYLIST[0].id, // Required for loop to work on single video
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          mute: 0, // Request unmuted start
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            event.target.setVolume?.(65);
            event.target.setPlaybackRate?.(1);
            event.target.unMute?.(); // Enforce unmuted
            event.target.playVideo();
            setReady(true);
            setPlaying(true);
            setMuted(false); // Update state to unmuted immediately

            // Still keep the fallback check, just in case
            setTimeout(() => {
              if (playerRef.current?.unMute) {
                playerRef.current.unMute();
              }
            }, 500);
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            const endedState = (window as any).YT?.PlayerState?.ENDED;
            if (endedState !== undefined && event.data === endedState) {
              // Auto-advance or Loop? User said "Looping". 
              // Usually bg music loops. If they want playlist cycle, we'd auto-advance.
              // For now, let's stick to looping the current track until "Next" is pressed,
              // or loop the playlist? "cycles through them" usually implies manual or auto.
              // Given "Macarena" loops endlessly, let's default to Loop Single, Manual Skip.
              event.target.seekTo(0);
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const previous = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        previous?.();
        if (!isMounted) return;
        createPlayer();
      };
      document.body.appendChild(tag);
    } else {
      createPlayer();
    }

    // Global interaction listener to unmute if needed
    const handleInteraction = () => {
      if (playerRef.current && playerRef.current.unMute) {
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setMuted(false);
        setPlaying(true);
      }
      // Remove listener after first interaction
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      isMounted = false;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Watch for index changes to load new video
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;

    // loadVideoById automatically plays by default, but we can be explicit
    if (player.loadVideoById) {
      player.loadVideoById(PLAYLIST[currentIndex].id);
      // We also verify that we want to be in a playing state
      if (playing) {
        // give it a tiny tick to ensure load doesn't swallow the play command if logic was async
        setTimeout(() => player.playVideo(), 100);
      }
    }
  }, [currentIndex, ready]);

  // Sync controls
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;

    try {
      if (playing) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }

      if (muted) {
        player.mute();
      } else {
        player.unMute();
      }
    } catch (e) {
      console.error("Audio player error:", e);
    }
  }, [muted, playing, ready]);

  const togglePlay = () => {
    if (!ready) return;
    setPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    if (!ready) return;
    setMuted((prev) => !prev);
  };

  const skipTrack = () => {
    if (!ready) return;
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
    setPlaying(true); // Ensure it plays when skipping
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1c16]/85 px-3 py-2 text-[#d9c8a5] shadow-xl backdrop-blur-md">
      <div ref={containerRef} className="hidden" aria-hidden="true" />
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Music2 className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs uppercase tracking-[0.14em] text-[#caa35d]">Now looping</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold whitespace-nowrap">
              <span className="md:hidden">{PLAYLIST[currentIndex].mobileTitle || PLAYLIST[currentIndex].title}</span>
              <span className="hidden md:inline">{PLAYLIST[currentIndex].title}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous track" // Actually just next, but good to have label
          className="hidden" // Hidden prev button if we wanted one
        />
        <button
          type="button"
          aria-label={playing ? 'Pause background audio' : 'Play background audio'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-50"
          onClick={togglePlay}
          disabled={!ready}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label="Next track"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-50"
          onClick={skipTrack}
          disabled={!ready}
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={muted ? 'Unmute background audio' : 'Mute background audio'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-50"
          onClick={toggleMute}
          disabled={!ready}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
