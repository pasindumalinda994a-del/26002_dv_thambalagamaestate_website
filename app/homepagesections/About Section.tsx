"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ST_PRIORITY } from "@/lib/scroll-refresh";
import { usePreloaderComplete } from "../components/SitePreloader";

const ABOUT_COPY =
  "We aren't a hotel. We are a private estate where the only luxury is the silence of the forest. Reserved for one group at a time.";

const ABOUT_WORDS = ABOUT_COPY.split(" ");

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const preloaderComplete = usePreloaderComplete();

  useEffect(() => {
    if (!preloaderComplete) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!sectionRef.current || !headingRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const letters = headingRef.current!.querySelectorAll("[data-letter]");

      gsap.set(letters, { clearProps: "color", opacity: 0.34 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "center 40%",
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
    }, sectionRef);

    return () => ctx.revert();
  }, [preloaderComplete]);

  return (
    <section
      ref={sectionRef}
      aria-label="About"
      data-ambient-zone="about"
      className="relative flex min-h-screen items-center justify-center bg-deep-forest"
    >
      <h2
        ref={headingRef}
        className="mx-auto max-w-4xl px-6 text-center font-space-grotesk text-[clamp(36px,9.23vw,54px)] font-bold leading-[130%] tracking-[0.5px] text-cream"
      >
        {ABOUT_WORDS.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block">
            {word.split("").map((letter, letterIndex) => (
              <span
                key={letterIndex}
                data-letter
                className="inline-block"
                style={{ opacity: 0.34 }}
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
