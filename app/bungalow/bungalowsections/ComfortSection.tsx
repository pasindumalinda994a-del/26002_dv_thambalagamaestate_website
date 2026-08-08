"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { H2 } from "../../components/H2";
import { Paragraph } from "../../components/Paragraph";
import { BUNGALOW_COMFORT } from "../content";
import { FeatureLabelRow } from "./FeatureLabelRow";
import { ImageMosaic } from "./ImageMosaic";

const CLIP_COLLAPSED = "polygon(0 0, 100% 0, 100% 0, 0 0)";
const CLIP_FULL = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

export function ComfortSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [accentA, accentB] = BUNGALOW_COMFORT.accents;
  const [large, top, bottom] = BUNGALOW_COMFORT.mosaic;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const frames = section.querySelectorAll<HTMLElement>("[data-clip-reveal]");
    if (!frames.length) return;

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(frames, { clipPath: CLIP_FULL });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(frames, { clipPath: CLIP_COLLAPSED });
      // Paired accents share one trigger; slight stagger for polish
      gsap.to(frames, {
        clipPath: CLIP_FULL,
        ease: "power2.out",
        duration: 1.1,
        stagger: 0.18,
        scrollTrigger: {
          trigger: frames[0],
          start: "top 50%",
          once: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Crafted for comfort"
      className="flex flex-col gap-10 px-5 md:gap-16 md:px-8"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
        <H2 className="max-w-[678px] uppercase text-deep-forest">
          {BUNGALOW_COMFORT.headline}
        </H2>
        <Paragraph className="max-w-[698px] text-forest-green lg:pt-2">
          {BUNGALOW_COMFORT.body}
        </Paragraph>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:ml-auto lg:w-[calc(50%-1rem)] lg:max-w-[698px]">
        <div
          data-clip-reveal
          className="relative aspect-[329/424] overflow-hidden bg-[#D9D9D9]"
          style={{ clipPath: CLIP_COLLAPSED }}
        >
          <Image
            src={accentA.src}
            alt={accentA.alt}
            fill
            sizes="(max-width: 1024px) 45vw, 330px"
            className="object-cover"
          />
        </div>
        <div
          data-clip-reveal
          className="relative mt-10 aspect-[328/389] overflow-hidden bg-[#D9D9D9] md:mt-24"
          style={{ clipPath: CLIP_COLLAPSED }}
        >
          <Image
            src={accentB.src}
            alt={accentB.alt}
            fill
            sizes="(max-width: 1024px) 45vw, 330px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 md:gap-6">
        <ImageMosaic large={large} top={top} bottom={bottom} />
        <FeatureLabelRow labels={BUNGALOW_COMFORT.features} />
      </div>
    </section>
  );
}
