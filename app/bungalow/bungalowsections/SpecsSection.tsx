"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLayoutEffect, useRef } from "react";
import { ST_PRIORITY } from "@/lib/scroll-refresh";
import { H2 } from "../../components/H2";
import { BUNGALOW_SPECS } from "../content";
import { FeatureLabelRow } from "./FeatureLabelRow";
import { ImageMosaic } from "./ImageMosaic";

const MOBILE_MQ = "(max-width: 767px)";
const TRIGGER_START = "top 90%";

export function SpecsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDListElement>(null);
  const [large, top, bottom] = BUNGALOW_SPECS.mosaic;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const useBlur = !window.matchMedia(MOBILE_MQ).matches;
    let cancelled = false;
    let ctx: gsap.Context | undefined;

    const setup = () => {
      if (cancelled || !listRef.current) return;

      ctx = gsap.context(() => {
        const rows = list.querySelectorAll<HTMLElement>("[data-spec-row]");

        rows.forEach((row) => {
          const value = row.querySelector<HTMLElement>("[data-spec-value]");
          const label = row.querySelector<HTMLElement>("[data-spec-label]");
          const line = row.querySelector<HTMLElement>("[data-spec-line]");
          if (!value || !line) return;

          gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
          if (label) gsap.set(label, { opacity: 0, y: 12 });

          // Use a Tween (not Timeline) for scrollTrigger so GSAP refreshes
          // immediately. Timeline+scrollTrigger defers init with end=0, which
          // crashes later ScrollTriggers that force-refresh unfinished ones.
          SplitText.create(value, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            linesClass: "spec-line",
            charsClass: "inline-block",
            onSplit(self) {
              if (!self.chars.length) return;

              gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
              gsap.set(self.chars, {
                y: "1.1em",
                opacity: 0.2,
                ...(useBlur ? { filter: "blur(12px)" } : { filter: "none" }),
              });

              return gsap.to(self.chars, {
                y: 0,
                opacity: 1,
                ...(useBlur ? { filter: "blur(0px)" } : { filter: "none" }),
                duration: 0.8,
                ease: "power4.out",
                stagger: 0.02,
                delay: 0.08,
                scrollTrigger: {
                  trigger: row,
                  start: TRIGGER_START,
                  once: true,
                  invalidateOnRefresh: true,
                  refreshPriority: ST_PRIORITY.h2,
                },
                onStart() {
                  if (label) {
                    gsap.to(label, {
                      opacity: 1,
                      y: 0,
                      duration: 0.55,
                      ease: "power3.out",
                    });
                  }
                  gsap.to(line, {
                    scaleX: 1,
                    duration: 0.75,
                    ease: "power2.out",
                    delay: 0.17,
                  });
                },
              });
            },
          });
        });
      }, list);
    };

    const fonts = document.fonts;
    if (fonts?.status === "loaded") {
      setup();
    } else if (fonts?.ready) {
      fonts.ready.then(setup);
    } else {
      setup();
    }

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Estate specifications"
      className="flex flex-col gap-10 px-5 md:gap-16 md:px-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8 lg:items-start">
        <H2 className="max-w-[678px] uppercase text-deep-forest">
          {BUNGALOW_SPECS.headline}
        </H2>

        <dl ref={listRef} className="flex w-full flex-col">
          {BUNGALOW_SPECS.rows.map((row) => (
            <div
              key={row.label}
              data-spec-row
              className="relative flex flex-col gap-2 py-4 md:flex-row md:gap-16 md:py-6"
            >
              <dt
                data-spec-label
                className="w-[90px] shrink-0 font-secondary text-xs font-medium uppercase leading-[150%] tracking-[0.2px] text-[#9D9A85]"
              >
                {row.label}
              </dt>
              <dd
                data-spec-value
                className="font-secondary text-base font-normal leading-[150%] tracking-[0.2px] text-deep-forest"
              >
                {row.value}
              </dd>
              <div
                data-spec-line
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px bg-[#CFCBB1]"
              />
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-5 md:gap-6">
        <ImageMosaic large={large} top={top} bottom={bottom} />
        <FeatureLabelRow labels={BUNGALOW_SPECS.features} />
      </div>
    </section>
  );
}
