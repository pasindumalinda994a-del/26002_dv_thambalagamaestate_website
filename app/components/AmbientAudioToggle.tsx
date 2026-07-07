"use client";

import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/ambient-forest.mp3";
const VOLUME = 0.35;

function SpeakerOnIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M11 5L6 9H3V15H6L11 19V5Z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5C16.5 9.5 17 10.7 17 12C17 13.3 16.5 14.5 15.5 15.5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <path
        d="M18 6C19.8 7.8 20.8 9.8 20.8 12C20.8 14.2 19.8 16.2 18 18"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M11 5L6 9H3V15H6L11 19V5Z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9L22 15M22 9L16 15"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AmbientAudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(false);
  const wasPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = VOLUME;
    audio.loop = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPlayingRef.current = isPlayingRef.current;
        if (!audio.paused) audio.pause();
        return;
      }

      if (wasPlayingRef.current) {
        audio.play().catch(() => {
          setIsPlaying(false);
          wasPlayingRef.current = false;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      wasPlayingRef.current = false;
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        wasPlayingRef.current = true;
      })
      .catch(() => {
        setIsPlaying(false);
        wasPlayingRef.current = false;
      });
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="none" />
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? "Turn sound off" : "Turn sound on"}
        aria-pressed={isPlaying}
        className={[
          "fixed bottom-6 right-6 z-[400]",
          "flex h-11 w-11 items-center justify-center rounded-full",
          "bg-cream/16 text-cream",
          "ring-1 ring-inset ring-cream/32",
          "shadow-[0_4px_10px_0] shadow-black/8",
          "backdrop-blur-[10px]",
          "transition-opacity hover:opacity-90",
        ].join(" ")}
      >
        {isPlaying ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
      </button>
    </>
  );
}
