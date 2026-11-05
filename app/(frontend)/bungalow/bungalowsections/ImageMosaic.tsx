"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { BungalowImage } from "../content";

type ImageMosaicProps = {
  large: BungalowImage;
  top: BungalowImage;
  bottom: BungalowImage;
};

export function ImageMosaic({ large, top, bottom }: ImageMosaicProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const frames = root.querySelectorAll<HTMLElement>("[data-fade-in]");
    if (!frames.length) return;

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(frames, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const [largeEl, topEl, bottomEl] = Array.from(frames);
      gsap.set(frames, { opacity: 0 });

      // Large + top reveal together; short stagger reads as one beat
      if (largeEl && topEl) {
        gsap.to([largeEl, topEl], {
          opacity: 1,
          duration: 1.4,
          ease: "power1.inOut",
          stagger: 0.18,
          scrollTrigger: {
            trigger: largeEl,
            start: "top 50%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (bottomEl) {
        gsap.to(bottomEl, {
          opacity: 1,
          duration: 1.4,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: bottomEl,
            start: "top 50%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-5"
    >
      <div
        data-fade-in
        className="relative aspect-[16/11] overflow-hidden bg-[#D9D9D9] md:aspect-auto md:min-h-[420px] lg:aspect-[853/764] lg:min-h-[764px]"
      >
        <Image
          src={large.src}
          alt={large.alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-5">
        <div
          data-fade-in
          className="relative aspect-square overflow-hidden bg-[#D9D9D9] md:aspect-[501/372]"
        >
          <Image
            src={top.src}
            alt={top.alt}
            fill
            sizes="(max-width: 768px) 45vw, 35vw"
            className="object-cover"
          />
        </div>
        <div
          data-fade-in
          className="relative aspect-square overflow-hidden bg-[#D9D9D9] md:aspect-[501/372]"
        >
          <Image
            src={bottom.src}
            alt={bottom.alt}
            fill
            sizes="(max-width: 768px) 45vw, 35vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
