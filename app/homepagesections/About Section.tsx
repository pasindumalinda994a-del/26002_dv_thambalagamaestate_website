"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const ABOUT_COPY =
  "We aren't a hotel. We are a private estate where the only luxury is the silence of the forest. Reserved for one group at a time.";

const ABOUT_WORDS = ABOUT_COPY.split(" ");
const LETTER_REVEAL_DURATION = 0.2;

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!sectionRef.current || !headingRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const letters = headingRef.current!.querySelectorAll("[data-letter]");

      gsap.set(letters, { opacity: 0.34 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "center center",
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to(letters, {
          opacity: 1,
          ease: "none",
          duration: LETTER_REVEAL_DURATION,
          stagger: {
            each: LETTER_REVEAL_DURATION,
          },
        });
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="About"
      className="relative z-10 mt-[-100svh] flex min-h-screen translate-y-[100svh] items-center justify-center bg-forest-green will-change-transform motion-reduce:mt-0 motion-reduce:translate-y-0"
    >
      <h2
        ref={headingRef}
        className="mx-auto max-w-4xl px-6 text-center font-primary text-[clamp(36px,2.25vw+28.8px,54px)] font-normal leading-[130%] tracking-[0.5px] text-cream"
      >
        {ABOUT_WORDS.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block">
            {word.split("").map((letter, letterIndex) => (
              <span
                key={letterIndex}
                data-letter
                className="inline-block opacity-[0.34]"
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
