"use client";

import gsap from "gsap";
import { useLenis } from "lenis/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  dispatchAmbientSoundPreference,
  getAmbientSoundPreference,
} from "@/lib/ambient-sound";
import { HOME_CRITICAL_ASSETS } from "@/lib/preload-assets";
import {
  lockScrollRestoration,
  refreshScrollTriggers,
  scrollToHero,
} from "@/lib/scroll-refresh";
import { Button } from "./Button";

/** Full progress arc — long enough for each status phase to read. */
const PROGRESS_DURATION_MS = 7000;
const MAX_ASSET_WAIT_MS = 5000;
const HOLD_AT_100_MS = 1600;
const DEEP_FOREST = "#18200e";
const WIPE_DURATION = 0.9;
const WIPE_EASE = "power2.inOut";
/** Soft edge width for the percentage mask wipe (as % of text width). */
const PERCENT_MASK_FEATHER = 14;

function percentMaskImage(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped <= 0) {
    return "linear-gradient(90deg, transparent 0%, transparent 100%)";
  }
  if (clamped >= 1) {
    return "linear-gradient(90deg, #000 0%, #000 100%)";
  }

  const p = clamped * 100;
  const solidEnd = Math.max(0, p - PERCENT_MASK_FEATHER);
  const fadeEnd = Math.min(100, p + PERCENT_MASK_FEATHER);

  return `linear-gradient(90deg, #000 0%, #000 ${solidEnd}%, transparent ${fadeEnd}%)`;
}

function applyPercentMask(el: HTMLElement | null, t: number) {
  if (!el) return;
  const mask = percentMaskImage(t);
  gsap.set(el, {
    webkitMaskImage: mask,
    maskImage: mask,
    webkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    webkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  });
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

async function waitForCriticalAssets(srcs: readonly string[]) {
  const images = Promise.all(srcs.map(preloadImage));
  const fonts =
    typeof document !== "undefined" && "fonts" in document
      ? document.fonts.ready.then(() => undefined).catch(() => undefined)
      : Promise.resolve();

  await Promise.all([images, fonts]);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function statusForProgress(progress: number): string {
  if (progress >= 100) return "WELCOME TO THAMBALAGAMA";
  if (progress >= 50) return "ESTABLISHING CONNECTION TO THE FOREST...";
  if (progress >= 25) return "UNESCO BUFFER ZONE: ACTIVE";
  return "COORD: 6°24'N 80°28'E";
}

function wordRangesOf(text: string) {
  const ranges: { start: number; end: number }[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

const STATUS_CHAR_CLASS =
  "font-secondary text-base font-medium uppercase tracking-[0.18em]";

/** Sequential word scramble without per-frame React state (Lighthouse TBT). */
function PreloaderStatusText({ text }: { text: string }) {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chars = Array.from(text);
    const ranges = wordRangesOf(text);
    const pool = Array.from(new Set(chars.filter((char) => char !== " ")));
    const revealed = new Set<number>();
    let wordIndex = 0;

    host.replaceChildren();
    const nodes = chars.map((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00a0" : char;
      span.className =
        char === " " ? "" : `${STATUS_CHAR_CLASS} text-cream/40`;
      host.appendChild(span);
      return span;
    });

    const visibleUntil = () =>
      wordIndex >= ranges.length
        ? text.length
        : (ranges[wordIndex]?.end ?? text.length);

    const paint = () => {
      const cutoff = visibleUntil();
      for (let i = 0; i < nodes.length; i++) {
        const char = chars[i];
        if (char === " ") continue;
        if (revealed.has(i)) {
          nodes[i].textContent = char;
          nodes[i].className = `${STATUS_CHAR_CLASS} text-cream`;
          continue;
        }
        if (i >= cutoff) {
          nodes[i].textContent = char;
          nodes[i].className = `${STATUS_CHAR_CLASS} text-cream/40`;
          continue;
        }
        nodes[i].textContent =
          pool[Math.floor(Math.random() * pool.length)] ?? char;
        nodes[i].className = `${STATUS_CHAR_CLASS} text-cream/40`;
      }
    };

    paint();

    const id = window.setInterval(() => {
      if (wordIndex >= ranges.length) {
        for (let i = 0; i < chars.length; i++) {
          if (chars[i] === " ") continue;
          revealed.add(i);
          nodes[i].textContent = chars[i];
          nodes[i].className = `${STATUS_CHAR_CLASS} text-cream`;
        }
        window.clearInterval(id);
        return;
      }

      const word = ranges[wordIndex];
      let next = -1;
      for (let i = word.start; i < word.end; i++) {
        if (chars[i] !== " " && !revealed.has(i)) {
          next = i;
          break;
        }
      }
      if (next !== -1) revealed.add(next);

      let wordDone = true;
      for (let i = word.start; i < word.end; i++) {
        if (chars[i] !== " " && !revealed.has(i)) {
          wordDone = false;
          break;
        }
      }
      if (wordDone) wordIndex += 1;
      paint();
    }, 20);

    return () => window.clearInterval(id);
  }, [text]);

  return (
    <p className="min-h-[1.25em] text-center font-secondary text-base font-medium uppercase tracking-[0.18em] text-cream">
      <span className="sr-only">{text}</span>
      <span
        ref={hostRef}
        aria-hidden="true"
        className="inline-block whitespace-pre-wrap"
      />
    </p>
  );
}

function HeadphonesIcon() {
  return (
    <svg
      aria-hidden
      width={40}
      height={40}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-cream"
    >
      <path
        d="M4 13v3.5A2.5 2.5 0 0 0 6.5 19h.5A1.5 1.5 0 0 0 8.5 17.5v-2A1.5 1.5 0 0 0 7 14H4Zm16 0v3.5A2.5 2.5 0 0 1 17.5 19h-.5A1.5 1.5 0 0 1 15.5 17.5v-2A1.5 1.5 0 0 1 17 14h3Z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <path
        d="M4 14a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

type PreloaderProps = {
  assets?: readonly string[];
  onComplete?: () => void;
};

export function Preloader({
  assets = HOME_CRITICAL_ASSETS,
  onComplete,
}: PreloaderProps) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const soundDialogRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLParagraphElement>(null);
  const percentGhostRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef(0);
  const statusTextRef = useRef(statusForProgress(0));
  const setProgressSafe = useRef<(value: number) => void>(() => {});
  const exitingRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const bodyStylesRef = useRef({ overflow: "", backgroundColor: "" });
  const exitTlRef = useRef<gsap.core.Timeline | null>(null);

  const [mounted, setMounted] = useState(true);
  const [status, setStatus] = useState(statusForProgress(0));
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  setProgressSafe.current = (value: number) => {
    const next = Math.round(Math.min(100, Math.max(0, value)));
    if (next !== progressRef.current) {
      progressRef.current = next;
      const label = `${next}%`;
      if (percentRef.current) percentRef.current.textContent = label;
      if (percentGhostRef.current) percentGhostRef.current.textContent = label;
    }

    const nextStatus = statusForProgress(next);
    if (nextStatus === statusTextRef.current) return;
    statusTextRef.current = nextStatus;
    setStatus(nextStatus);
  };

  const finish = () => {
    document.body.style.overflow = bodyStylesRef.current.overflow;
    document.body.style.backgroundColor = bodyStylesRef.current.backgroundColor;
    scrollToHero(lenisRef.current);
    lenisRef.current?.start();
    refreshScrollTriggers(50);
    window.setTimeout(() => scrollToHero(lenisRef.current), 80);
    onCompleteRef.current?.();
    setMounted(false);
  };

  const runWipeExit = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;

    const root = rootRef.current;
    const reduceMotion = reduceMotionRef.current;

    if (reduceMotion || !root) {
      finish();
      return;
    }

    const dialog = soundDialogRef.current;
    const tl = gsap.timeline({
      defaults: { ease: WIPE_EASE },
      onComplete: finish,
    });
    exitTlRef.current = tl;

    if (dialog) {
      tl.to(dialog, {
        opacity: 0,
        y: -12,
        duration: 0.35,
      });
    }

    tl.to(
      root,
      {
        yPercent: -100,
        duration: WIPE_DURATION,
      },
      dialog ? "-=0.1" : 0,
    );
  };

  const handleSoundChoice = (enabled: boolean) => {
    if (exitingRef.current) return;
    dispatchAmbientSoundPreference(enabled);
    runWipeExit();
  };

  const runWipeExitRef = useRef(runWipeExit);
  runWipeExitRef.current = runWipeExit;

  useLayoutEffect(() => {
    lockScrollRestoration();
    scrollToHero(lenisRef.current);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reduceMotionRef.current = prefersReduced;
    setReduceMotion(prefersReduced);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    lenis?.stop();
    scrollToHero(lenis);
    return () => {
      lenis?.start();
    };
  }, [mounted, lenis]);

  useEffect(() => {
    if (!showSoundPrompt) return;
    const primary = soundDialogRef.current?.querySelector<HTMLButtonElement>(
      "button",
    );
    primary?.focus();
  }, [showSoundPrompt]);

  useEffect(() => {
    if (!mounted) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reduceMotionRef.current = reduceMotion;

    bodyStylesRef.current = {
      overflow: document.body.style.overflow,
      backgroundColor: document.body.style.backgroundColor,
    };

    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = DEEP_FOREST;

    let cancelled = false;
    let progressTween: gsap.core.Tween | null = null;
    let promptTl: gsap.core.Timeline | null = null;

    const applyProgress = (t: number) => {
      if (barRef.current) {
        gsap.set(barRef.current, { scaleX: t, transformOrigin: "left center" });
      }
      if (!reduceMotion) {
        applyPercentMask(percentRef.current, t);
      }
      setProgressSafe.current(t * 100);
    };

    const revealSoundPrompt = () => {
      if (cancelled || exitingRef.current) return;

      const content = contentRef.current;

      if (reduceMotion || !content) {
        setShowSoundPrompt(true);
        return;
      }

      promptTl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          if (!cancelled) setShowSoundPrompt(true);
        },
      });

      promptTl.to(content, {
        opacity: 0,
        y: -12,
        scale: 0.96,
        duration: 0.45,
      });
    };

    const run = async () => {
      const progressProxy = { t: 0 };

      const assetsReady = Promise.race([
        waitForCriticalAssets(assets),
        delay(MAX_ASSET_WAIT_MS),
      ]);

      if (reduceMotion) {
        applyPercentMask(percentRef.current, 1);
        applyProgress(1);
        await assetsReady;
      } else {
        gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });
        applyPercentMask(percentRef.current, 0);

        const progressDone = new Promise<void>((resolve) => {
          progressTween = gsap.to(progressProxy, {
            t: 1,
            duration: PROGRESS_DURATION_MS / 1000,
            ease: "none",
            onUpdate: () => {
              applyProgress(progressProxy.t);
            },
            onComplete: () => resolve(),
          });
        });

        await Promise.all([assetsReady, progressDone]);
      }

      if (cancelled || exitingRef.current) return;

      applyProgress(1);

      if (!reduceMotion) {
        await delay(HOLD_AT_100_MS);
      }

      if (cancelled || exitingRef.current) return;

      const existingPreference = getAmbientSoundPreference();
      if (existingPreference === false) {
        dispatchAmbientSoundPreference(false);
        runWipeExitRef.current();
        return;
      }
      if (existingPreference === true) {
        runWipeExitRef.current();
        return;
      }

      revealSoundPrompt();
    };

    void run();

    return () => {
      cancelled = true;
      progressTween?.kill();
      promptTl?.kill();
      exitTlRef.current?.kill();
      document.body.style.overflow = bodyStylesRef.current.overflow;
      document.body.style.backgroundColor = bodyStylesRef.current.backgroundColor;
    };
  }, [assets, mounted]);

  useEffect(() => {
    if (!showSoundPrompt || !soundDialogRef.current) return;

    const reduceMotion = reduceMotionRef.current;
    if (reduceMotion) {
      gsap.set(soundDialogRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      soundDialogRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );
  }, [showSoundPrompt]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      role={showSoundPrompt ? "presentation" : "status"}
      aria-live={showSoundPrompt ? undefined : "polite"}
      aria-busy={showSoundPrompt ? undefined : "true"}
      aria-label={
        showSoundPrompt ? undefined : "Loading Thambalagama Estate"
      }
      className="fixed inset-0 z-1000 flex items-center justify-center overflow-hidden bg-deep-forest"
    >
      {!showSoundPrompt && (
        <div
          ref={contentRef}
          className="flex flex-col items-center gap-5 px-6"
        >
          <div className="relative min-w-[3.2ch] font-space-grotesk text-[95px] font-bold leading-none tracking-tight tabular-nums">
            <p
              ref={percentGhostRef}
              className="select-none text-cream/20"
              aria-hidden="true"
            >
              0%
            </p>
            <p
              ref={percentRef}
              className="absolute inset-0 select-none text-cream will-change-[mask-image]"
              style={{
                WebkitMaskImage: percentMaskImage(0),
                maskImage: percentMaskImage(0),
              }}
            >
              0%
            </p>
          </div>
          <div className="h-0.5 w-44 overflow-hidden bg-cream/20 md:w-52">
            <div
              ref={barRef}
              className="h-full w-full origin-left scale-x-0 bg-cream"
            />
          </div>
          {reduceMotion ? (
            <p className="min-h-[1.25em] text-center font-secondary text-base font-medium uppercase tracking-[0.18em] text-cream">
              {status}
            </p>
          ) : (
            <PreloaderStatusText key={status} text={status} />
          )}
        </div>
      )}

      {showSoundPrompt && (
        <div
          ref={soundDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preloader-sound-title"
          className="flex flex-col items-center gap-8 px-6 opacity-0"
        >
          <div className="flex flex-col items-center gap-4">
            <HeadphonesIcon />
            <h2
              id="preloader-sound-title"
              className="max-w-md text-center font-secondary text-base font-normal tracking-[0.02em] text-cream md:text-lg"
            >
              The forest is closer with headphones.
            </h2>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="light"
              size="large"
              className="outline-none"
              onClick={() => handleSoundChoice(true)}
            >
              Sound On
            </Button>
            <Button
              type="button"
              variant="glass"
              size="large"
              className="outline-none"
              onClick={() => handleSoundChoice(false)}
            >
              Sound Off
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
