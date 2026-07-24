"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useBooking } from "../components/booking/BookingProvider";
import { Button } from "../components/SolidButton";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";
import { ScrollDownHint } from "../components/ScrollDownHint";
import { ensureScrollTriggerConfig } from "@/lib/scroll-refresh";

const VIDEO_SRC = "/videos/Hero%20Section%20Bg2.mp4";
const POSTER_SRC = "/main%20images/Hero%20Poster.webp";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureScrollTriggerConfig();

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
        .to(buttonRef.current, { opacity: 0, ease: "none" }, 0)
        .to(scrollHintRef.current, { opacity: 0, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream"
    >
      <div ref={videoWrapRef} className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER_SRC}
          preload="metadata"
          className="h-full w-full object-cover"
          src={VIDEO_SRC}
        />

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
