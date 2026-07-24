"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";
import { LENIS_OPTIONS } from "@/lib/lenis-config";
import { ensureScrollTriggerConfig } from "@/lib/scroll-refresh";

gsap.registerPlugin(ScrollTrigger);
ensureScrollTriggerConfig();

function LenisGSAPConnector() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    ensureScrollTriggerConfig();
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    // Mild lag smoothing under load — avoids death-spiral on mobile frame drops.
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  if (reduceMotion) {
    return children;
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisGSAPConnector />
      {children}
    </ReactLenis>
  );
}
