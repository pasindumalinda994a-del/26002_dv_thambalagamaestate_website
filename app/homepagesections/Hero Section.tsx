"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useBooking } from "../components/booking/BookingProvider";
import { Button } from "../components/SolidButton";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";
import { ScrollDownHint } from "../components/ScrollDownHint";
import { ST_PRIORITY } from "@/lib/scroll-refresh";

const VIDEO_SRC = "/videos/Hero%20Section%20Bg2.mp4";
const POSTER_SRC = "/main%20images/Hero%20Poster.webp";
const MOBILE_MQ = "(max-width: 767px)";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();
  // Default to image so mobile never mounts <video>; desktop upgrades after mount.
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setUseVideo(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.matchMedia(MOBILE_MQ).matches;

    const ctx = gsap.context(() => {
      gsap.set(mediaWrapRef.current, { transformOrigin: "center center" });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
          refreshPriority: ST_PRIORITY.hero,
        },
      });

      timeline.to(
        mediaWrapRef.current,
        {
          scale: 0.6,
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
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream"
    >
      <div ref={mediaWrapRef} className="absolute inset-0 overflow-hidden">
        {useVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={POSTER_SRC}
            preload="metadata"
            className="h-full w-full object-cover"
            src={VIDEO_SRC}
          />
        ) : (
          <Image
            src={POSTER_SRC}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        <div aria-hidden className="absolute inset-0 bg-black/29" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pb-20 text-center md:pb-24">
        <H1
          ref={h1Ref}
          className="mb-10 max-w-5xl overflow-hidden uppercase text-cream md:mb-20"
        >
          The edge of the
          <br />
          Sinharaja rainforest.
        </H1>

        <Paragraph
          ref={pRef}
          className="mb-10 max-w-xl overflow-hidden text-cream md:mb-20"
        >
          A fully private 18-guest reserve on the Sinharaja buffer zone. Where
          the rainforest belongs only to you.
        </Paragraph>

        <div ref={buttonRef}>
          <Button onClick={openBooking}>Check Availability</Button>
        </div>
      </div>

      <div
        ref={scrollHintRef}
        className="absolute inset-x-0 bottom-6 z-10 flex justify-center md:bottom-10"
      >
        <ScrollDownHint />
      </div>
    </section>
  );
}
