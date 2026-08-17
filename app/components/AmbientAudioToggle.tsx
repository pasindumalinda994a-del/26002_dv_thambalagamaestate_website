"use client";

import gsap from "gsap";
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
import {
  AMBIENT_LAYERS,
  AMBIENT_LAYER_SRCS,
  AMBIENT_MASTER,
  BIRD_PAN_LFO_AMP,
  BIRD_PAN_LFO_HZ,
  FILTER_LERP_TAU,
  LAYER_LERP_TAU,
  LAYER_PAN,
  decayVelocityBump,
  getLayerTargets,
  getToneTargets,
  lerpToward,
  type AmbientLayer,
  type LayerMix,
} from "@/lib/homepage-ambient-mix";

type AmbientAudioToggleProps = {
  audioSrc?: string;
  className?: string;
  buttonRef?: Ref<HTMLButtonElement>;
};

type AmbientAudioContextValue = {
  isPlaying: boolean;
  toggle: () => void;
};

export type AmbientMode = "single" | "layers";

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(
  null,
);

const DEFAULT_AUDIO_SRC =
  "/audio/jungle-ambience.mp3";
const SINGLE_VOLUME = 0.35;

const ZERO_MIX: LayerMix = {
  wind: 0,
  birds: 0,
  insects: 0,
  water: 0,
  waterfall: 0,
  foliage: 0,
};

const ZERO_PAN: Record<AmbientLayer, number> = {
  wind: LAYER_PAN.wind,
  birds: LAYER_PAN.birds,
  insects: LAYER_PAN.insects,
  water: LAYER_PAN.water,
  waterfall: LAYER_PAN.waterfall,
  foliage: LAYER_PAN.foliage,
};

type LayerChain = {
  filter: BiquadFilterNode;
  pan: StereoPannerNode;
  gain: GainNode;
};

function AudioContextCtor(): typeof AudioContext | undefined {
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

function scrambleLoopOffset(el: HTMLAudioElement) {
  const apply = () => {
    if (el.duration && Number.isFinite(el.duration) && el.duration > 1) {
      el.currentTime = Math.random() * el.duration;
    }
  };
  if (el.readyState >= 1) apply();
  else el.addEventListener("loadedmetadata", apply, { once: true });
}

export type SoundButtonVariant = "glass" | "dark" | "light";

const SINE_WAVE_CREAM = "/icons/sine-wave.svg";
const SINE_WAVE_FOREST = "/icons/sine-wave-forest.svg";

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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

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
  mode = "single",
  children,
}: {
  audioSrc?: string;
  mode?: AmbientMode;
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const layerRefs = useRef<Record<AmbientLayer, HTMLAudioElement | null>>({
    wind: null,
    birds: null,
    insects: null,
    water: null,
    waterfall: null,
    foliage: null,
  });
  const currentMixRef = useRef<LayerMix>({ ...ZERO_MIX });
  const currentFilterRef = useRef(12000);
  const currentPanRef = useRef<Record<AmbientLayer, number>>({ ...ZERO_PAN });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const chainsRef = useRef<Partial<Record<AmbientLayer, LayerChain>>>({});
  const webAudioRef = useRef(false);
  const isPlayingRef = useRef(false);
  const wasPlayingRef = useRef(false);
  const playRef = useRef<(fadeIn?: boolean) => void>(() => {});
  const pauseRef = useRef<() => void>(() => {});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const isLayers = mode === "layers";

    const layerElements = () =>
      AMBIENT_LAYERS.map((layer) => layerRefs.current[layer]).filter(
        (el): el is HTMLAudioElement => el != null,
      );

    const applyLayerVolumes = () => {
      const mix = currentMixRef.current;
      const useGraph = webAudioRef.current;
      for (const layer of AMBIENT_LAYERS) {
        const el = layerRefs.current[layer];
        const chain = chainsRef.current[layer];
        if (useGraph && chain) {
          chain.gain.gain.value = clamp01(mix[layer]);
          if (el) el.volume = 1;
          continue;
        }
        if (!el) continue;
        el.volume = clamp01(mix[layer] * AMBIENT_MASTER);
      }
    };

    const applyTone = () => {
      if (!webAudioRef.current) return;
      for (const layer of AMBIENT_LAYERS) {
        const chain = chainsRef.current[layer];
        if (!chain) continue;
        chain.filter.frequency.value = currentFilterRef.current;
        chain.pan.pan.value = currentPanRef.current[layer];
      }
    };

    const ensureWebAudio = async () => {
      const Ctor = AudioContextCtor();
      if (!Ctor) return false;

      try {
        const ctx = audioCtxRef.current ?? new Ctor();
        audioCtxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume();

        if (!masterGainRef.current) {
          const master = ctx.createGain();
          master.gain.value = AMBIENT_MASTER;
          master.connect(ctx.destination);
          masterGainRef.current = master;
        }

        const master = masterGainRef.current;
        for (const layer of AMBIENT_LAYERS) {
          const el = layerRefs.current[layer];
          if (!el || chainsRef.current[layer]) continue;
          el.volume = 1;
          const source = ctx.createMediaElementSource(el);
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = currentFilterRef.current;
          filter.Q.value = 0.65;
          const pan = ctx.createStereoPanner();
          pan.pan.value = LAYER_PAN[layer];
          const gain = ctx.createGain();
          gain.gain.value = 0;
          source.connect(filter);
          filter.connect(pan);
          pan.connect(gain);
          gain.connect(master);
          chainsRef.current[layer] = { filter, pan, gain };
        }

        webAudioRef.current = true;
        return true;
      } catch {
        webAudioRef.current = false;
        return false;
      }
    };

    const tick = (time: number, deltaTime: number) => {
      if (!isPlayingRef.current) return;
      const dt = Math.min(0.1, Math.max(0, deltaTime / 1000));
      decayVelocityBump(dt);
      const targets = getLayerTargets();
      const current = currentMixRef.current;
      for (const layer of AMBIENT_LAYERS) {
        current[layer] = lerpToward(
          current[layer],
          targets[layer],
          dt,
          LAYER_LERP_TAU[layer],
        );
      }

      const tone = getToneTargets();
      currentFilterRef.current = lerpToward(
        currentFilterRef.current,
        tone.lowpass,
        dt,
        FILTER_LERP_TAU,
      );

      const birdLfo =
        Math.sin(time * Math.PI * 2 * BIRD_PAN_LFO_HZ) * BIRD_PAN_LFO_AMP;
      for (const layer of AMBIENT_LAYERS) {
        const base = LAYER_PAN[layer];
        currentPanRef.current[layer] =
          layer === "birds"
            ? Math.max(-1, Math.min(1, base + birdLfo))
            : base;
      }

      applyLayerVolumes();
      applyTone();
    };

    const playLayers = (fadeIn: boolean) => {
      void (async () => {
        await ensureWebAudio();
        if (fadeIn) currentMixRef.current = { ...ZERO_MIX };
        applyLayerVolumes();

        const pending = layerElements().map((el) => {
          el.loop = true;
          if (fadeIn) scrambleLoopOffset(el);
          return el.play();
        });

        try {
          await Promise.all(pending);
          setIsPlaying(true);
          wasPlayingRef.current = true;
          gsap.ticker.remove(tick);
          gsap.ticker.add(tick);
        } catch {
          setIsPlaying(false);
          wasPlayingRef.current = false;
          gsap.ticker.remove(tick);
          layerElements().forEach((el) => el.pause());
        }
      })();
    };

    const pauseLayers = () => {
      gsap.ticker.remove(tick);
      layerElements().forEach((el) => el.pause());
      setIsPlaying(false);
      wasPlayingRef.current = false;
      void audioCtxRef.current?.suspend();
    };

    const playSingle = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = SINGLE_VOLUME;
      audio.loop = true;
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

    const pauseSingle = () => {
      const audio = audioRef.current;
      if (audio) audio.pause();
      setIsPlaying(false);
      wasPlayingRef.current = false;
    };

    const play = (fadeIn = true) => {
      if (isLayers) playLayers(fadeIn);
      else playSingle();
    };

    const pause = () => {
      if (isLayers) pauseLayers();
      else pauseSingle();
    };

    playRef.current = play;
    pauseRef.current = pause;

    const applyPreference = (enabled: boolean) => {
      if (enabled) play(true);
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
        if (isLayers) {
          gsap.ticker.remove(tick);
          layerElements().forEach((el) => {
            if (!el.paused) el.pause();
          });
          void audioCtxRef.current?.suspend();
        } else {
          const audio = audioRef.current;
          if (audio && !audio.paused) audio.pause();
        }
        return;
      }

      if (wasPlayingRef.current) play(false);
    };

    window.addEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      gsap.ticker.remove(tick);
      if (isLayers) {
        layerElements().forEach((el) => el.pause());
      } else {
        audioRef.current?.pause();
      }
    };
  }, [mode]);

  const toggle = () => {
    if (isPlaying) pauseRef.current();
    else playRef.current(true);
  };

  return (
    <AmbientAudioContext.Provider value={{ isPlaying, toggle }}>
      {mode === "layers" ? (
        AMBIENT_LAYERS.map((layer) => (
          <audio
            key={layer}
            ref={(el) => {
              layerRefs.current[layer] = el;
            }}
            src={AMBIENT_LAYER_SRCS[layer]}
            preload="none"
            loop
          />
        ))
      ) : (
        <audio ref={audioRef} src={audioSrc} preload="none" />
      )}
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
