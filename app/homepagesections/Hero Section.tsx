"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useBooking } from "../components/booking/BookingProvider";
import { Button } from "../components/SolidButton";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";
import { ScrollDownHint } from "../components/ScrollDownHint";
import { ST_PRIORITY } from "@/lib/scroll-refresh";
import { useTempPalette } from "../components/TempPaletteToggle";

const HERO_BG_SRC =
  "/homepageimages/DSC_0471.jpg_2K_202607261120.jpeg";
const MOBILE_MQ = "(max-width: 767px)";

export function HeroSection() {
  const { palette } = useTempPalette();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();
  const isDark = palette === "dark";

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
      className={`relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden ${
        isDark ? "bg-cream" : "bg-deep-forest"
      }`}
    >
      <div ref={mediaWrapRef} className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_BG_SRC}
          alt=""
          fill
          priority
          quality={95}
          sizes="(max-width: 767px) 200vw, 100vw"
          className="object-cover object-[90%_center] md:object-center"
        />

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
