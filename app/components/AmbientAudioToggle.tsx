"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import {
  AMBIENT_SOUND_EVENT,
  getAmbientSoundPreference,
  type AmbientSoundDetail,
} from "@/lib/ambient-sound";

type AmbientAudioToggleProps = {
  audioSrc?: string;
};

const DEFAULT_AUDIO_SRC = "/audio/ambient-forest.mp3";
const VOLUME = 0.35;

/** Resting wave (matches public/Icons/Frame 1261155686.svg). */
const WAVE_REST =
  "M24.5 29C21.5 29 20.31 24.76 19.05 20.28C18.14 17.04 17 13 15.5 13C12.11 13 12 19.93 12 20H10C10 19.63 10.06 11 15.5 11C18.5 11 19.71 15.25 20.97 19.74C21.83 22.8 23 27 24.5 27C27.94 27 28.03 20.07 28.03 20H30.03C30.03 20.37 29.97 29 24.5 29Z";

/** Peak-shifted variants — same command structure for GSAP attr tweening. */
const WAVE_A =
  "M24.5 29C21.5 29 20.31 25.6 19.05 18.9C18.14 15.5 17 11.5 15.5 11.5C12.11 11.5 12 19.93 12 20H10C10 19.63 10.06 9.5 15.5 9.5C18.5 9.5 19.71 14.2 20.97 20.8C21.83 24.2 23 28 24.5 28C27.94 28 28.03 20.07 28.03 20H30.03C30.03 20.37 29.97 29 24.5 29Z";

const WAVE_B =
  "M24.5 29C21.5 29 20.31 23.8 19.05 21.5C18.14 18.6 17 14.5 15.5 14.5C12.11 14.5 12 19.93 12 20H10C10 19.63 10.06 12.5 15.5 12.5C18.5 12.5 19.71 16.4 20.97 18.6C21.83 21.4 23 26 24.5 26C27.94 26 28.03 20.07 28.03 20H30.03C30.03 20.37 29.97 29 24.5 29Z";

export function AmbientAudioToggle({
  audioSrc = DEFAULT_AUDIO_SRC,
}: AmbientAudioToggleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const waveTweenRef = useRef<gsap.core.Timeline | null>(null);
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

    const play = () => {
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

    const pause = () => {
      audio.pause();
      setIsPlaying(false);
      wasPlayingRef.current = false;
    };

    const applyPreference = (enabled: boolean) => {
      if (enabled) play();
      else pause();
    };

    const stored = getAmbientSoundPreference();
    if (stored === true) applyPreference(true);

    const handleAmbientSound = (event: Event) => {
      const detail = (event as CustomEvent<AmbientSoundDetail>).detail;
      if (!detail) return;
      applyPreference(detail.enabled);
    };

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

    window.addEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  useEffect(() => {
    const path = wavePathRef.current;
    if (!path) return;

    waveTweenRef.current?.kill();
    waveTweenRef.current = null;
    gsap.set(path, { attr: { d: WAVE_REST } });

    if (!isPlaying) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(path, {
      attr: { d: WAVE_A },
      duration: 0.7,
      ease: "sine.inOut",
    }).to(path, {
      attr: { d: WAVE_B },
      duration: 0.7,
      ease: "sine.inOut",
    });
    waveTweenRef.current = tl;

    return () => {
      tl.kill();
      waveTweenRef.current = null;
      gsap.set(path, { attr: { d: WAVE_REST } });
    };
  }, [isPlaying]);

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
      <audio ref={audioRef} src={audioSrc} preload="none" />
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? "Turn sound off" : "Turn sound on"}
        aria-pressed={isPlaying}
        className={[
          "fixed top-4 right-4 z-502",
          "flex size-10 items-center justify-center",
          "transition-opacity hover:opacity-80",
          isPlaying ? "opacity-100" : "opacity-50",
        ].join(" ")}
      >
        <svg
          width={40}
          height={40}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect
            x="0.5"
            y="0.5"
            width="39"
            height="39"
            rx="19.5"
            stroke="white"
          />
          <path ref={wavePathRef} d={WAVE_REST} fill="white" />
        </svg>
      </button>
    </>
  );
}
