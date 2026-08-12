"use client";

import gsap from "gsap";
import { useLenis } from "lenis/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { dispatchAmbientSoundPreference } from "@/lib/ambient-sound";
import { HOME_CRITICAL_ASSETS } from "@/lib/preload-assets";
import { refreshScrollTriggers } from "@/lib/scroll-refresh";
import { Button } from "./Button";

/** Full progress arc — long enough for each status phase to read. */
const PROGRESS_DURATION_MS = 5200;
const MAX_ASSET_WAIT_MS = 5000;
const HOLD_AT_100_MS = 1100;
const SESSION_KEY = "te-preloader-seen";
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

export function Preloader() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const soundDialogRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLParagraphElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef(0);
  const statusTextRef = useRef(statusForProgress(0));
  const setProgressSafe = useRef<(value: number) => void>(() => {});
  const exitingRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const bodyStylesRef = useRef({ overflow: "", backgroundColor: "" });
  const exitTlRef = useRef<gsap.core.Timeline | null>(null);

  const [mounted, setMounted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(statusForProgress(0));
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);

  setProgressSafe.current = (value: number) => {
    const next = Math.round(Math.min(100, Math.max(0, value)));
    if (next === progressRef.current) return;
    progressRef.current = next;
    setProgress(next);

    const nextStatus = statusForProgress(next);
    if (nextStatus === statusTextRef.current) return;
    statusTextRef.current = nextStatus;

    const el = statusRef.current;
    if (!el) {
      setStatus(nextStatus);
      return;
    }

    gsap.to(el, {
      opacity: 0,
      y: 4,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setStatus(nextStatus);
        gsap.fromTo(
          el,
          { opacity: 0, y: -4 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        );
      },
    });
  };

  const finish = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }

    document.body.style.overflow = bodyStylesRef.current.overflow;
    document.body.style.backgroundColor = bodyStylesRef.current.backgroundColor;
    lenisRef.current?.start();
    refreshScrollTriggers(50);
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

  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setMounted(false);
      }
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    lenis?.stop();
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
        waitForCriticalAssets(HOME_CRITICAL_ASSETS),
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
  }, [mounted]);

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
            <p className="select-none text-cream/20" aria-hidden="true">
              {progress}%
            </p>
            <p
              ref={percentRef}
              className="absolute inset-0 select-none text-cream will-change-[mask-image]"
              style={{
                WebkitMaskImage: percentMaskImage(0),
                maskImage: percentMaskImage(0),
              }}
            >
              {progress}%
            </p>
          </div>
          <div className="h-px w-44 overflow-hidden bg-cream/20 md:w-52">
            <div
              ref={barRef}
              className="h-full w-full origin-left scale-x-0 bg-cream"
            />
          </div>
          <p
            ref={statusRef}
            className="min-h-[1.25em] text-center font-secondary text-base font-medium uppercase tracking-[0.18em] text-cream"
          >
            {status}
          </p>
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
          <h2
            id="preloader-sound-title"
            className="max-w-md text-center font-secondary text-base font-normal tracking-[0.02em] text-cream md:text-lg"
          >
            For the full experience, turn on your sound.
          </h2>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="light"
              size="large"
              onClick={() => handleSoundChoice(true)}
            >
              Sound On
            </Button>
            <Button
              type="button"
              variant="glass"
              size="large"
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
