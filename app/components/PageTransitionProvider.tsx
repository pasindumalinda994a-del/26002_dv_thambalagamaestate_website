"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { refreshScrollTriggers, scrollToHero } from "@/lib/scroll-refresh";

gsap.registerPlugin(SplitText);

const COVER_DURATION = 0.9;
const REVEAL_DURATION = 0.9;
const MIN_HOLD_MS = 400;
const SAFETY_TIMEOUT_MS = 6000;
const EASE = "power2.inOut";
const TITLE_IN_DURATION = 0.85;
const TITLE_OUT_DURATION = 0.4;
const TITLE_STAGGER = 0.04;
const MOBILE_MQ = "(max-width: 767px)";

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/bungalow": "Sanctuary",
  "/forest": "Forest",
  "/experiences": "Experience",
  "/gallery": "Gallery",
};

type PendingTransition = {
  href: string;
  previousOverflow: string;
  coverComplete: boolean;
  routeReady: boolean;
};

type PageTransitionContextValue = {
  navigate: (href: string) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used within PageTransitionProvider");
  }
  return ctx;
}

function normalizePath(href: string) {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

function getPageLabel(href: string): string {
  const path = normalizePath(href);
  const known = PAGE_LABELS[path];
  if (known) return known;

  const segment = path.split("/").filter(Boolean).pop() ?? "";
  if (!segment) return "Home";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function shouldSkipTransition(href: string, pathname: string) {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) {
    return true;
  }
  if (href.startsWith("/admin") || pathname.startsWith("/admin")) {
    return true;
  }
  return normalizePath(href) === normalizePath(pathname);
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const [transitionLabel, setTransitionLabel] = useState("");
  const curtainRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLParagraphElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const busyRef = useRef(false);
  const pendingRef = useRef<PendingTransition | null>(null);
  const coverTlRef = useRef<gsap.core.Timeline | null>(null);
  const revealTlRef = useRef<gsap.core.Timeline | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealingRef = useRef(false);

  // GSAP owns transform — never set curtain yPercent via React style.
  useLayoutEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;
    gsap.set(curtain, { yPercent: 100, pointerEvents: "none" });
  }, []);

  const cleanupSplit = useCallback(() => {
    splitRef.current?.revert();
    splitRef.current = null;
  }, []);

  const prepareTitleSplit = useCallback(() => {
    const el = titleTextRef.current;
    if (!el || !el.textContent?.trim()) return;

    cleanupSplit();

    const useBlur = !window.matchMedia(MOBILE_MQ).matches;
    splitRef.current = SplitText.create(el, {
      type: "lines,chars",
      mask: "lines",
      autoSplit: true,
      linesClass: "transition-title-line",
      charsClass: "inline-block",
      onSplit(self) {
        if (!self.chars.length) return;
        gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
        gsap.set(self.chars, {
          y: 200,
          opacity: 0.2,
          ...(useBlur ? { filter: "blur(20px)" } : { filter: "none" }),
        });
      },
    });
  }, [cleanupSplit]);

  const animateTitleIn = useCallback(() => {
    const chars = splitRef.current?.chars;
    if (!chars?.length) return;

    const useBlur = !window.matchMedia(MOBILE_MQ).matches;
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      ...(useBlur ? { filter: "blur(0px)" } : { filter: "none" }),
      duration: TITLE_IN_DURATION,
      ease: "power4.out",
      stagger: TITLE_STAGGER,
    });
  }, []);

  const animateTitleOut = useCallback(() => {
    const chars = splitRef.current?.chars;
    if (!chars?.length) return null;

    const useBlur = !window.matchMedia(MOBILE_MQ).matches;
    return {
      targets: chars,
      vars: {
        y: -120,
        opacity: 0,
        ...(useBlur ? { filter: "blur(12px)" } : { filter: "none" }),
        duration: TITLE_OUT_DURATION,
        ease: "power3.in",
        stagger: TITLE_STAGGER * 0.5,
      } satisfies gsap.TweenVars,
    };
  }, []);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current !== null) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearSafetyTimer();
    const pending = pendingRef.current;
    const curtain = curtainRef.current;
    cleanupSplit();
    setTransitionLabel("");
    if (curtain) {
      gsap.set(curtain, { yPercent: 100, pointerEvents: "none" });
    }
    document.body.style.overflow = pending?.previousOverflow ?? "";
    scrollToHero(lenisRef.current);
    lenisRef.current?.start();
    refreshScrollTriggers(50);
    window.setTimeout(() => scrollToHero(lenisRef.current), 80);
    pendingRef.current = null;
    revealingRef.current = false;
    busyRef.current = false;
  }, [cleanupSplit, clearSafetyTimer]);

  const startReveal = useCallback(() => {
    const pending = pendingRef.current;
    const curtain = curtainRef.current;
    if (!pending || !pending.coverComplete || !pending.routeReady) return;
    if (revealingRef.current) return;
    if (!curtain) {
      finish();
      return;
    }

    revealingRef.current = true;
    clearSafetyTimer();
    scrollToHero(lenisRef.current);

    revealTlRef.current?.kill();
    const tl = gsap.timeline({
      defaults: { ease: EASE },
      onComplete: finish,
    });
    tl.to({}, { duration: MIN_HOLD_MS / 1000 });

    const titleOut = animateTitleOut();
    if (titleOut) {
      tl.to(titleOut.targets, titleOut.vars);
    }

    tl.to(
      curtain,
      { yPercent: -100, duration: REVEAL_DURATION },
      `-=${TITLE_OUT_DURATION * 0.35}`,
    ).set(curtain, { yPercent: 100, pointerEvents: "none" });

    revealTlRef.current = tl;
  }, [animateTitleOut, clearSafetyTimer, finish]);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || pending.routeReady) return;
    if (normalizePath(pathname) !== normalizePath(pending.href)) return;

    pending.routeReady = true;
    startReveal();
  }, [pathname, startReveal]);

  useEffect(() => {
    return () => {
      clearSafetyTimer();
      coverTlRef.current?.kill();
      revealTlRef.current?.kill();
      cleanupSplit();
    };
  }, [cleanupSplit, clearSafetyTimer]);

  const navigate = useCallback(
    (href: string) => {
      if (busyRef.current) return;

      const pathnameNow = pathnameRef.current;

      if (shouldSkipTransition(href, pathnameNow)) {
        if (normalizePath(href) === normalizePath(pathnameNow)) {
          if (!href.startsWith("#")) {
            scrollToHero(lenisRef.current);
          }
        } else {
          scrollToHero(lenisRef.current);
          router.push(href, { scroll: false });
        }
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scrollToHero(lenisRef.current);
        router.push(href, { scroll: false });
        return;
      }

      const curtain = curtainRef.current;
      if (!curtain) {
        scrollToHero(lenisRef.current);
        router.push(href, { scroll: false });
        return;
      }

      busyRef.current = true;
      revealingRef.current = false;
      cleanupSplit();
      flushSync(() => {
        setTransitionLabel(getPageLabel(href));
      });
      prepareTitleSplit();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      lenisRef.current?.stop();

      pendingRef.current = {
        href,
        previousOverflow,
        coverComplete: false,
        routeReady: false,
      };

      clearSafetyTimer();
      safetyTimerRef.current = setTimeout(() => {
        const pending = pendingRef.current;
        if (!pending) return;
        pending.coverComplete = true;
        pending.routeReady = true;
        startReveal();
      }, SAFETY_TIMEOUT_MS);

      coverTlRef.current?.kill();
      revealTlRef.current?.kill();

      gsap.set(curtain, { pointerEvents: "auto" });

      coverTlRef.current = gsap
        .timeline({ defaults: { ease: EASE } })
        .fromTo(
          curtain,
          { yPercent: 100 },
          { yPercent: 0, duration: COVER_DURATION },
        )
        .add(animateTitleIn, COVER_DURATION * 0.45)
        .add(() => {
          const pending = pendingRef.current;
          if (!pending) return;
          pending.coverComplete = true;
          scrollToHero(lenisRef.current);
          router.push(href, { scroll: false });
          startReveal();
        });
    },
    [
      animateTitleIn,
      cleanupSplit,
      clearSafetyTimer,
      prepareTitleSplit,
      router,
      startReveal,
    ],
  );

  return (
    <PageTransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={curtainRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-1100 flex items-center justify-center bg-deep-forest"
      >
        <div className="flex items-center justify-center overflow-hidden px-6">
          <p
            ref={titleTextRef}
            className="font-space-grotesk text-[clamp(28px,6vw,48px)] font-medium uppercase leading-[130%] tracking-[0.2px] text-cream"
          >
            {transitionLabel}
          </p>
        </div>
      </div>
    </PageTransitionContext.Provider>
  );
}
