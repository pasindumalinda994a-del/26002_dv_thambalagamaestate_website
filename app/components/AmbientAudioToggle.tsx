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
  dispatchAmbientSoundPreference,
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
  INSECT_PAN_LFO_AMP,
  INSECT_PAN_LFO_HZ,
  INSECT_PAN_LFO_PHASE,
  LAYER_HIGHPASS_HZ,
  LAYER_LERP_TAU,
  LAYER_PAN,
  LAYER_TRIM,
  decayVelocityBump,
  getLayerTargets,
  getToneTargets,
  lerpToward,
  type AmbientLayer,
  type LayerMix,
} from "@/lib/homepage-ambient-mix";

type AmbientAudioContextValue = {
  isPlaying: boolean;
  toggle: () => void;
};

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(
  null,
);

const ZERO_MIX: LayerMix = {
  wind: 0,
  birds: 0,
  insects: 0,
  water: 0,
  waterfall: 0,
  foliage: 0,
};

const ZERO_PAN: Record<AmbientLayer, number> = { ...LAYER_PAN };

const HERO_LAYERS: readonly AmbientLayer[] = [
  "wind",
  "birds",
  "insects",
  "foliage",
];
const DEFERRED_LAYERS: readonly AmbientLayer[] = ["water", "waterfall"];
const SILENCE_FLOOR = 0.02;
const FADE_SECONDS = 0.45;

type LayerChain = {
  highpass: BiquadFilterNode;
  filter: BiquadFilterNode;
  pan: StereoPannerNode;
  gain: GainNode;
};

const graph = {
  ctx: null as AudioContext | null,
  master: null as GainNode | null,
  chains: {} as Partial<Record<AmbientLayer, LayerChain>>,
  hooked: new WeakSet<HTMLAudioElement>(),
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

function useAmbientAudio() {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) {
    throw new Error(
      "AmbientAudioButton must be used within AmbientAudioProvider",
    );
  }
  return ctx;
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

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const layerRefs = useRef<Record<AmbientLayer, HTMLAudioElement | null>>({
    wind: null,
    birds: null,
    insects: null,
    water: null,
    waterfall: null,
    foliage: null,
  });
  const currentMixRef = useRef<LayerMix>({ ...ZERO_MIX });
  const currentLayerFilterRef = useRef<Record<AmbientLayer, number>>({
    wind: 12000,
    birds: 12000,
    insects: 12000,
    water: 12000,
    waterfall: 12000,
    foliage: 12000,
  });
  const currentPanRef = useRef<Record<AmbientLayer, number>>({ ...ZERO_PAN });
  const isPlayingRef = useRef(false);
  const playRef = useRef<(fadeIn?: boolean) => void>(() => {});
  const pauseRef = useRef<() => void>(() => {});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const layerEl = (layer: AmbientLayer) => layerRefs.current[layer];

    const attachSrc = (layer: AmbientLayer) => {
      const el = layerEl(layer);
      if (!el) return el;
      if (!el.getAttribute("src")) {
        el.src = AMBIENT_LAYER_SRCS[layer];
      }
      el.loop = true;
      return el;
    };

    const applyLayerVolumes = () => {
      const mix = currentMixRef.current;
      for (const layer of AMBIENT_LAYERS) {
        const level = Math.max(0, mix[layer] * LAYER_TRIM[layer]);
        const chain = graph.chains[layer];
        if (chain) {
          chain.gain.gain.value = level;
          continue;
        }
        const el = layerEl(layer);
        if (el) el.volume = Math.min(1, level * AMBIENT_MASTER);
      }
    };

    const applyTone = () => {
      if (!graph.ctx) return;
      for (const layer of AMBIENT_LAYERS) {
        const chain = graph.chains[layer];
        if (!chain?.highpass || !chain.filter) continue;
        chain.highpass.frequency.value = LAYER_HIGHPASS_HZ[layer];
        chain.filter.frequency.value = currentLayerFilterRef.current[layer];
        chain.pan.pan.value = currentPanRef.current[layer];
      }
    };

    const fadeMaster = (to: number, seconds = FADE_SECONDS) => {
      const master = graph.master;
      const ctx = graph.ctx;
      if (!master || !ctx) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(to, now + seconds);
    };

    const ensureWebAudio = async () => {
      const Ctor = AudioContextCtor();
      if (!Ctor) return false;

      try {
        const ctx = graph.ctx ?? new Ctor();
        graph.ctx = ctx;
        if (ctx.state === "suspended") await ctx.resume();

        if (!graph.master) {
          const master = ctx.createGain();
          master.gain.value = 0;
          master.connect(ctx.destination);
          graph.master = master;
        }

        const master = graph.master;
        for (const layer of AMBIENT_LAYERS) {
          const el = layerEl(layer);
          if (!el || graph.chains[layer] || graph.hooked.has(el)) continue;
          try {
            el.volume = 1;
            const source = ctx.createMediaElementSource(el);
            graph.hooked.add(el);
            const highpass = ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.value = LAYER_HIGHPASS_HZ[layer];
            highpass.Q.value = 0.7;
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = currentLayerFilterRef.current[layer];
            filter.Q.value = 0.65;
            const pan = ctx.createStereoPanner();
            pan.pan.value = LAYER_PAN[layer];
            const gain = ctx.createGain();
            gain.gain.value = 0;
            source.connect(highpass);
            highpass.connect(filter);
            filter.connect(pan);
            pan.connect(gain);
            gain.connect(master);
            graph.chains[layer] = { highpass, filter, pan, gain };
          } catch {
            /* already hooked on a previous mount */
          }
        }

        return true;
      } catch {
        return false;
      }
    };

    const playLayer = (layer: AmbientLayer, fadeIn: boolean) => {
      const el = attachSrc(layer);
      if (!el) return;
      el.loop = true;
      if (fadeIn) scrambleLoopOffset(el);
      void el.play().catch(() => {
        /* autoplay / decode failure — keep other layers */
      });
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
      for (const layer of AMBIENT_LAYERS) {
        currentLayerFilterRef.current[layer] = lerpToward(
          currentLayerFilterRef.current[layer],
          tone.layerLowpass[layer],
          dt,
          FILTER_LERP_TAU,
        );
      }

      const birdLfo =
        Math.sin(time * Math.PI * 2 * BIRD_PAN_LFO_HZ) * BIRD_PAN_LFO_AMP;
      const insectLfo =
        Math.sin(
          time * Math.PI * 2 * INSECT_PAN_LFO_HZ + INSECT_PAN_LFO_PHASE,
        ) * INSECT_PAN_LFO_AMP;
      for (const layer of AMBIENT_LAYERS) {
        const base = LAYER_PAN[layer];
        if (layer === "birds") {
          currentPanRef.current[layer] = Math.max(
            -1,
            Math.min(1, base + birdLfo),
          );
        } else if (layer === "insects") {
          currentPanRef.current[layer] = Math.max(
            -1,
            Math.min(1, base + insectLfo),
          );
        } else {
          currentPanRef.current[layer] = base;
        }
      }

      for (const layer of DEFERRED_LAYERS) {
        if (targets[layer] > SILENCE_FLOOR) playLayer(layer, false);
      }

      for (const layer of AMBIENT_LAYERS) {
        const el = layerEl(layer);
        if (!el?.getAttribute("src")) continue;
        const silent =
          current[layer] < SILENCE_FLOOR && targets[layer] < SILENCE_FLOOR;
        if (silent) {
          if (!el.paused) el.pause();
        } else if (el.paused) {
          void el.play().catch(() => {});
        }
      }

      applyLayerVolumes();
      applyTone();
    };

    const play = (fadeIn = true) => {
      void (async () => {
        if (fadeIn) currentMixRef.current = { ...ZERO_MIX };
        await ensureWebAudio();
        applyLayerVolumes();
        fadeMaster(AMBIENT_MASTER, fadeIn ? FADE_SECONDS : 0.05);

        for (const layer of HERO_LAYERS) {
          playLayer(layer, fadeIn);
        }

        const targets = getLayerTargets();
        for (const layer of DEFERRED_LAYERS) {
          if (targets[layer] > SILENCE_FLOOR) playLayer(layer, fadeIn);
        }

        setIsPlaying(true);
        gsap.ticker.remove(tick);
        gsap.ticker.add(tick);
      })();
    };

    const pause = () => {
      fadeMaster(0, FADE_SECONDS);
      window.setTimeout(() => {
        if (isPlayingRef.current) return;
        gsap.ticker.remove(tick);
        AMBIENT_LAYERS.forEach((layer) => layerEl(layer)?.pause());
        void graph.ctx?.suspend();
      }, FADE_SECONDS * 1000);
      setIsPlaying(false);
    };

    playRef.current = play;
    pauseRef.current = pause;

    const handleAmbientSound = (event: Event) => {
      const detail = (event as CustomEvent<AmbientSoundDetail>).detail;
      if (!detail) return;
      if (detail.enabled) play(true);
      else pause();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!isPlayingRef.current) return;
        gsap.ticker.remove(tick);
        AMBIENT_LAYERS.forEach((layer) => {
          const el = layerEl(layer);
          if (el && !el.paused) el.pause();
        });
        void graph.ctx?.suspend();
        return;
      }

      if (getAmbientSoundPreference() === true) play(false);
    };

    let gestureCleanup: (() => void) | undefined;
    if (getAmbientSoundPreference() === true) {
      const unlock = () => play(true);
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
      gestureCleanup = () => {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
    }

    window.addEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      gestureCleanup?.();
      window.removeEventListener(AMBIENT_SOUND_EVENT, handleAmbientSound);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      gsap.ticker.remove(tick);
      AMBIENT_LAYERS.forEach((layer) => layerEl(layer)?.pause());
    };
  }, []);

  const toggle = () => {
    const next = !isPlaying;
    dispatchAmbientSoundPreference(next);
  };

  return (
    <AmbientAudioContext.Provider value={{ isPlaying, toggle }}>
      {AMBIENT_LAYERS.map((layer) => (
        <audio
          key={layer}
          ref={(el) => {
            layerRefs.current[layer] = el;
          }}
          preload="none"
          loop
        />
      ))}
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
