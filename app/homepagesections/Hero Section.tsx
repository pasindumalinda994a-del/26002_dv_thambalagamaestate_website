"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "../components/booking/BookingProvider";
import { Button } from "../components/Button";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";
import { ScrollDownHint } from "../components/ScrollDownHint";
import { usePreloaderComplete } from "../components/SitePreloader";
import {
  HERO_POSTER_SRC,
  HERO_VIDEO_MOBILE_SRC,
  HERO_VIDEO_SRC,
} from "@/lib/preload-assets";
import { ST_PRIORITY } from "@/lib/scroll-refresh";

const MOBILE_MQ = "(max-width: 767px)";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();
  const preloaderComplete = usePreloaderComplete();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!preloaderComplete) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.matchMedia(MOBILE_MQ).matches;

    const ctx = gsap.context(() => {
      gsap.set(mediaWrapRef.current, { transformOrigin: "center center" });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=75%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
          refreshPriority: ST_PRIORITY.hero,
        },
      });

      timeline.to(
        mediaWrapRef.current,
        {
          scale: 0.45,
          ease: "none",
          duration: 1,
        },
        0,
      );

      if (isMobile) {
        timeline.to(h1Ref.current, { opacity: 0, ease: "none" }, 0);
      } else {
        timeline.to(
          h1Ref.current,
          {
            letterSpacing: "0.18em",
            maxWidth: "120%",
            opacity: 0,
            ease: "none",
          },
          0,
        );
      }

      timeline
        .to(pRef.current, { opacity: 0, ease: "none" }, 0)
        .to(buttonRef.current, { opacity: 0, ease: "none" }, 0)
        .to(scrollHintRef.current, { opacity: 0, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, [preloaderComplete]);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      data-ambient-zone="hero"
      className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream"
    >
      <div ref={mediaWrapRef} className="absolute inset-0 overflow-hidden">
        {preloaderComplete ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_POSTER_SRC}
              alt=""
              width={1920}
              height={1080}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_POSTER_SRC}
              onCanPlay={() => setVideoReady(true)}
              className={[
                "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500",
                videoReady ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <source
                src={HERO_VIDEO_MOBILE_SRC}
                type="video/mp4"
                media="(max-width: 767px)"
              />
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
          </>
        ) : null}

        <div aria-hidden className="absolute inset-0 bg-black/20 md:bg-black/29" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <H1
          ref={h1Ref}
          className="mb-8 max-w-5xl overflow-hidden uppercase text-cream md:mb-10"
        >
          The edge of the
          <br />
          Sinharaja rainforest.
        </H1>

        <Paragraph
          ref={pRef}
          className="mb-12 max-w-xl overflow-hidden text-cream md:mb-12"
        >
          A fully private 18-guest reserve on the Sinharaja buffer zone. Where
          the rainforest belongs only to you.
        </Paragraph>

        <div ref={buttonRef}>
          <Button variant="light" onClick={openBooking}>Check Availability</Button>
        </div>
      </div>

      <div
        ref={scrollHintRef}
        className="absolute inset-x-0 bottom-20 z-10 flex justify-center md:bottom-10"
      >
        <ScrollDownHint />
      </div>
    </section>
  );
}
