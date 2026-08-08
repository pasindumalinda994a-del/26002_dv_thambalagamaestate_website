"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  AMBIENT_SOUND_EVENT,
  getAmbientSoundPreference,
  type AmbientSoundDetail,
} from "@/lib/ambient-sound";

type AmbientAudioToggleProps = {
  audioSrc?: string;
  className?: string;
  buttonRef?: Ref<HTMLButtonElement>;
};

type AmbientAudioContextValue = {
  isPlaying: boolean;
  toggle: () => void;
};

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(
  null,
);

const DEFAULT_AUDIO_SRC = "/audio/ambient-forest.mp3";
const VOLUME = 0.35;

export type SoundButtonVariant = "glass" | "dark" | "light";

const SINE_WAVE_CREAM = "/Icons/mdi-sine-wave.svg";
const SINE_WAVE_FOREST = "/Icons/mdi-sine-wave-forest.svg";

const VARIANT_SHELL: Record<SoundButtonVariant, string> = {
  glass:
    "rounded-full bg-cream/16 shadow-[0_4px_10px_0] shadow-black/8 ring-1 ring-inset ring-cream/32 backdrop-blur-[5px]",
  dark: "rounded-full bg-forest-green shadow-[0_4px_10px_0] shadow-black/8",
  light: "rounded-full bg-cream shadow-[0_4px_10px_0] shadow-black/8",
};

const VARIANT_ICON: Record<SoundButtonVariant, string> = {
  glass: SINE_WAVE_CREAM,
  dark: SINE_WAVE_CREAM,
  light: SINE_WAVE_FOREST,
};

const VARIANT_SLASH: Record<SoundButtonVariant, string> = {
  glass: "bg-cream",
  dark: "bg-cream",
  light: "bg-forest-green",
};

const DEFAULT_LAYOUT_CLASS =
  "fixed top-4 right-4 z-[502] flex size-12 items-center justify-center transition-opacity hover:opacity-80";

function useAmbientAudio() {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) {
    throw new Error(
      "AmbientAudioButton must be used within AmbientAudioProvider",
    );
  }
  return ctx;
}

export function AmbientAudioProvider({
  audioSrc = DEFAULT_AUDIO_SRC,
  children,
}: {
  audioSrc?: string;
  children: ReactNode;
}) {
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

  const toggle = () => {
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
    <AmbientAudioContext.Provider value={{ isPlaying, toggle }}>
      <audio ref={audioRef} src={audioSrc} preload="none" />
      {children}
    </AmbientAudioContext.Provider>
  );
}

export function AmbientAudioButton({
  className,
  buttonRef,
  variant = "glass",
}: {
  className?: string;
  buttonRef?: Ref<HTMLButtonElement>;
  variant?: SoundButtonVariant;
}) {
  const { isPlaying, toggle } = useAmbientAudio();

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={isPlaying ? "Turn sound off" : "Turn sound on"}
      aria-pressed={isPlaying}
      className={[
        VARIANT_SHELL[variant],
        className ?? DEFAULT_LAYOUT_CLASS,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="relative size-6 shrink-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={VARIANT_ICON[variant]}
          alt=""
          width={24}
          height={24}
          className="block size-full max-w-none"
        />
      </span>
      {!isPlaying && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="flex-none rotate-45">
            <span
              className={`block h-[25px] w-[2.5px] ${VARIANT_SLASH[variant]}`}
            />
          </span>
        </span>
      )}
    </button>
  );
}

/** Standalone toggle (audio + fixed button). Prefer Header integration. */
export function AmbientAudioToggle({
  audioSrc = DEFAULT_AUDIO_SRC,
  className,
  buttonRef,
}: AmbientAudioToggleProps) {
  return (
    <AmbientAudioProvider audioSrc={audioSrc}>
      <AmbientAudioButton className={className} buttonRef={buttonRef} />
    </AmbientAudioProvider>
  );
}
