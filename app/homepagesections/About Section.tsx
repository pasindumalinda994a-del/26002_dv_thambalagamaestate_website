"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ST_PRIORITY } from "@/lib/scroll-refresh";
import { useTempPalette } from "../components/TempPaletteToggle";

const ABOUT_COPY =
  "We aren't a hotel. We are a private estate where the only luxury is the silence of the forest. Reserved for one group at a time.";

const ABOUT_WORDS = ABOUT_COPY.split(" ");

const COLOR_TAN = "#dda15e";
const COLOR_DEEP_FOREST = "#18200e";

export function AboutSection() {
  const { palette } = useTempPalette();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isDark = palette === "dark";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!sectionRef.current || !headingRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const letters = headingRef.current!.querySelectorAll("[data-letter]");

      if (isDark) {
        gsap.set(letters, { clearProps: "color", opacity: 0.34 });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top center",
              end: "center center",
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: ST_PRIORITY.about,
            },
          })
          .to(letters, {
            opacity: 1,
            ease: "none",
            duration: 0.2,
            stagger: { each: 0.2 },
          });
        return;
      }

      // Light: color reveal only (tan → deep-forest), no opacity
      gsap.set(letters, { clearProps: "opacity", color: COLOR_TAN });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "center center",
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: ST_PRIORITY.about,
          },
        })
        .fromTo(
          letters,
          { color: COLOR_TAN },
          {
            color: COLOR_DEEP_FOREST,
            ease: "none",
            duration: 0.2,
            stagger: { each: 0.2 },
          },
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [isDark]);

  return (
    <section
      ref={sectionRef}
      aria-label="About"
      className={`relative flex min-h-screen items-center justify-center ${
        isDark ? "bg-deep-forest" : "bg-cream"
      }`}
    >
      <h2
        ref={headingRef}
        className={`mx-auto max-w-4xl px-6 text-center font-space-grotesk text-[clamp(36px,9.23vw,54px)] font-bold leading-[130%] tracking-[0.5px] ${
          isDark ? "text-cream" : ""
        }`}
      >
        {ABOUT_WORDS.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block">
            {word.split("").map((letter, letterIndex) => (
              <span
                key={letterIndex}
                data-letter
                className="inline-block"
                style={
                  isDark
                    ? { opacity: 0.34 }
                    : { color: COLOR_TAN, opacity: 1 }
                }
              >
                {letter}
              </span>
            ))}
            {wordIndex < ABOUT_WORDS.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </h2>
    </section>
  );
}
