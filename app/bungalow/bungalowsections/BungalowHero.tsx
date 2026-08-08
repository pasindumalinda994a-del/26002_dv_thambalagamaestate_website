"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { H1 } from "../../components/H1";
import { ScrollDownHint } from "../../components/ScrollDownHint";
import { BUNGALOW_HERO } from "../content";

/** Same travel as home Villa Section bg approach parallax. */
const BG_TRAVEL = 360;
const MOBILE_MQ = "(max-width: 767px)";

export function BungalowHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const bg = bgRef.current;
    const bgImage = bgImageRef.current;
    if (!section || !bg || !bgImage) return;

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.matchMedia(MOBILE_MQ).matches;

    const ctx = gsap.context(() => {
      // Overscale so y travel never reveals edges (same treatment as villa bg).
      gsap.set(bgImage, {
        transformOrigin: "center center",
        scale: 1.2,
      });

      // Desktop-only bg parallax — same travel as Villa Section.
      // Full visibility range so it reads while scrolling past a top-of-page hero.
      if (!isMobile) {
        gsap.fromTo(
          bg,
          { y: -BG_TRAVEL },
          {
            y: BG_TRAVEL,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
              refreshPriority: ST_PRIORITY.hero,
            },
          },
        );
      } else {
        gsap.set(bg, { y: 0 });
      }
    }, section);

    refreshScrollTriggers();

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Bungalow hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#B3B3B3]"
    >
      <div ref={bgRef} className="absolute inset-0">
        <div ref={bgImageRef} className="absolute inset-0">
          <Image
            src={BUNGALOW_HERO.image.src}
            alt={BUNGALOW_HERO.image.alt}
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover"
            onLoad={() => refreshScrollTriggers()}
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center">
        <H1 className="max-w-[1067px] overflow-hidden uppercase text-cream">
          {BUNGALOW_HERO.headline}
        </H1>
      </div>

      <div className="absolute inset-x-0 bottom-20 z-10 flex justify-center md:bottom-10">
        <ScrollDownHint label={BUNGALOW_HERO.scrollLabel} />
      </div>
    </section>
  );
}
