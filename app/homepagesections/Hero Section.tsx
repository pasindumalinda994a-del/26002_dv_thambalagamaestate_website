"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "../components/booking/BookingProvider";
import { Button } from "../components/SolidButton";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";

const VIDEO_SRC = "/videos/Hero%20Section%20Bg2.mp4";
const POSTER_SRC = "/main%20images/Hero%20Poster.webp";

function useHeroVideoEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference) and (prefers-reduced-data: no-preference)",
    );
    const update = () => setEnabled(mq.matches);

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return enabled;
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const useVideo = useHeroVideoEnabled();
  const { open: openBooking } = useBooking();

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
      className="relative z-0 flex min-h-svh flex-col items-center justify-center overflow-hidden bg-cream"
    >
      <div
        ref={videoWrapRef}
        className="absolute inset-0 overflow-hidden will-change-transform"
      >
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

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
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
    </section>
  );
}
