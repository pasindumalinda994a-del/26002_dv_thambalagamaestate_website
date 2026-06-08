"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";

const BG_SRC = "/main%20images/Vila%20Section%20BG.webp";
const VILLA_BG_SPEED = 0.2;
const VILLA_FG_SPEED = 1.5;

function VillaBackground() {
  return (
    <>
      <Image
        src={BG_SRC}
        alt=""
        fill
        sizes="100vw"
        className="scale-105 object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/20" />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"
      />
    </>
  );
}

export function VillaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const updateParallax = () => {
      if (!sectionRef.current) {
        ticking = false;
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
      );
      const centeredProgress = (progress - 0.5) * 2;
      const travelBase = centeredProgress * 240;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${travelBase * VILLA_BG_SPEED}px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${travelBase * VILLA_FG_SPEED}px, 0)`;
      }

      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Villa"
      className="relative min-h-screen overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <VillaBackground />
      </div>

      <div
        ref={contentRef}
        className="absolute inset-0 z-10 will-change-transform"
      >
        <VillaBackground />

        <div className="relative z-10 flex min-h-screen flex-col items-start justify-end gap-6 px-[clamp(1.25rem,4vw,2rem)] pb-12 md:pb-16">
          <H2 className="max-w-6xl uppercase text-cream">
            Crafted for comfort,
            <br />
            surrounded by the wild.
          </H2>

          <Paragraph className="max-w-lg text-cream">
            Expansive private living spaces opening out to a 360-degree panoramic
            view.
          </Paragraph>

          <GlassyButton href="/bungalow">Tour the bungalow</GlassyButton>
        </div>
      </div>
    </section>
  );
}
