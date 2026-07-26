"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/ambient-forest.mp3";
const ICON_SRC = "/Icons/Frame 1261155686.svg";
const VOLUME = 0.35;

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
          "fixed top-4 right-4 z-[502]",
          "flex size-10 items-center justify-center",
          "transition-opacity hover:opacity-80",
          isPlaying ? "opacity-100" : "opacity-50",
        ].join(" ")}
      >
        <Image src={ICON_SRC} alt="" width={40} height={40} aria-hidden />
      </button>
    </>
  );
}
