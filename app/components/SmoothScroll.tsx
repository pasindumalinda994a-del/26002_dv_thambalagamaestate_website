"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { LENIS_OPTIONS } from "@/lib/lenis-config";
import {
  ensureScrollTriggerConfig,
  lockScrollRestoration,
} from "@/lib/scroll-refresh";
import { usePreloaderComplete } from "./SitePreloader";

gsap.registerPlugin(ScrollTrigger);

function LenisGSAPConnector() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

const MOBILE_MQ = "(max-width: 767px)";
const COARSE_POINTER_MQ = "(pointer: coarse)";

function shouldEnableLenis() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  // Native scroll on phones/tablets — Lenis RAF + CSS adds lag on touch.
  if (
    window.matchMedia(MOBILE_MQ).matches ||
    window.matchMedia(COARSE_POINTER_MQ).matches
  ) {
    return false;
  }
  return true;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const preloaderComplete = usePreloaderComplete();
  const [enabled, setEnabled] = useState(false);

  useLayoutEffect(() => {
    lockScrollRestoration();
  }, []);

  useEffect(() => {
    ensureScrollTriggerConfig();
    if (!preloaderComplete) {
      setEnabled(false);
      return;
    }
    setEnabled(shouldEnableLenis());
  }, [preloaderComplete]);

  if (!enabled) {
    return children;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisGSAPConnector />
      {children}
    </ReactLenis>
  );
}
