"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { H1 } from "../../components/H1";
import { ScrollDownHint } from "../../components/ScrollDownHint";
import { EXPERIENCES_HERO } from "../content";

const BG_TRAVEL = 360;
const MOBILE_MQ = "(max-width: 767px)";

function subscribeMobile(onStoreChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getServerSnapshot() {
  return false;
}

export function ExperiencesHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerSnapshot,
  );

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const bg = bgRef.current;
    const bgImage = bgImageRef.current;
    if (!section || !bg || !bgImage) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(bgImage, {
        transformOrigin: "center center",
        scale: 1.2,
      });

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
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      aria-label="Experiences hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#B3B3B3]"
    >
      <div ref={bgRef} className="absolute inset-0">
        <div ref={bgImageRef} className="absolute inset-0">
          <Image
            src={EXPERIENCES_HERO.image.src}
            alt={EXPERIENCES_HERO.image.alt}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover"
            onLoad={() => refreshScrollTriggers()}
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 flex w-full min-w-0 flex-col items-center justify-center px-4 text-center md:px-6">
        <H1
          key={isMobile ? "mobile" : "desktop"}
          className="w-full max-w-[min(1067px,100%)] overflow-hidden break-words uppercase text-cream !text-[54px] md:!text-[clamp(54px,6.6vw,95px)]"
        >
          {isMobile
            ? EXPERIENCES_HERO.headlineMobile
            : EXPERIENCES_HERO.headlineDesktop}
        </H1>
      </div>

      <div className="absolute inset-x-0 bottom-20 z-10 flex justify-center md:bottom-10">
        <ScrollDownHint label={EXPERIENCES_HERO.scrollLabel} />
      </div>
    </section>
  );
}
