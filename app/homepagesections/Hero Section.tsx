"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";

const VIDEO_SRC = "/videos/Hero%20Section%20Bg.mp4";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(videoWrapRef.current, { transformOrigin: "center center" });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
        })
        .to(videoWrapRef.current, {
          scale: 0.6,
          borderRadius: 25,
          ease: "none",
          duration: 1,
        })
        .to(
          h1Ref.current,
          {
            letterSpacing: "0.18em",
            maxWidth: "120%",
            opacity: 0,
            ease: "none",
          },
          0,
        )
        .to(pRef.current, { opacity: 0, ease: "none" }, 0)
        .to(buttonRef.current, { opacity: 0, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream"
    >
      <div
        ref={videoWrapRef}
        className="absolute inset-0 overflow-hidden will-change-[transform,border-radius]"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          src={VIDEO_SRC}
        />

        <div aria-hidden className="absolute inset-0 bg-black/29" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-[clamp(1.5rem,3vw,2.5rem)] px-6 text-center">
        <H1
          ref={h1Ref}
          className="max-w-5xl overflow-hidden uppercase text-cream"
        >
          The edge of the
          <br />
          Sinharaja rainforest.
        </H1>

        <Paragraph ref={pRef} className="max-w-xl overflow-hidden text-cream">
          A fully private 18-guest reserve on the Sinharaja buffer zone. Where
          the rainforest belongs only to you.
        </Paragraph>

        <div ref={buttonRef}>
          <GlassyButton href="/book">Check Availability</GlassyButton>
        </div>
      </div>
    </section>
  );
}
