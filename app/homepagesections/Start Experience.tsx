"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { Paragraph } from "../components/Paragraph";

const BG_SRC = "/main%20images/Start%20Experience%20BG.JPG";
const LOGO_SRC = "/Logo/Thambalagama%20Logo.svg";
const CLOUD_LEFT_SRC = "/secondary%20images/Cloude%20Left.png";
const CLOUD_RIGHT_SRC = "/secondary%20images/Cloude%20Right.png";

export function StartExperience() {
  const [entered, setEntered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cloudLeftRef = useRef<HTMLDivElement>(null);
  const cloudRightRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (entered) return;

    document.body.style.overflow = "hidden";

    gsap.set(cloudLeftRef.current, { transformOrigin: "left center" });
    gsap.set(cloudRightRef.current, { transformOrigin: "right center" });
    gsap.set(bgRef.current, { transformOrigin: "center center" });

    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  const handleEnter = () => {
    if (isAnimating || entered) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return;
    }

    setIsAnimating(true);

    gsap
      .timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => setEntered(true),
      })
      .to(contentRef.current!.children, {
        opacity: 0,
        y: -16,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.out",
      })
      .addLabel("clouds", "-=0.15")
      .to(
        cloudLeftRef.current,
        {
          scale: 1.75,
          x: "-25vw",
          y: "-15vh",
          opacity: 0,
          duration: 1.5,
          ease: "power3.inOut",
        },
        "clouds",
      )
      .to(
        cloudRightRef.current,
        {
          scale:  1.75,
          x: "25vw",
          y: "10vh",
          opacity: 0,
          duration: 1.5,
          ease: "power3.inOut",
        },
        "clouds",
      )
      .to(
        [bgRef.current, overlayRef.current],
        { scale: 2.0, opacity: 0, duration: 1.5, ease: "power2.in" },
        "clouds+=0.05",
      );
  };

  if (entered) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Start experience"
      className="fixed inset-0 z-1000 flex flex-col items-center justify-center overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <Image
          src={BG_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div
        ref={overlayRef}
        aria-hidden
        className="absolute inset-0 bg-black/29 will-change-transform"
      />

      <div
        ref={cloudLeftRef}
        aria-hidden
        className="pointer-events-none absolute top-[24%] -left-8 z-1 aspect-483/340 w-[clamp(320px,38vw,483px)] -translate-y-1/2 will-change-transform md:top-1/3 md:left-0"
      >
        <Image
          src={CLOUD_LEFT_SRC}
          alt=""
          fill
          sizes="(max-width: 768px) 260px, 38vw"
          className="object-contain object-left"
        />
      </div>

      <div
        ref={cloudRightRef}
        aria-hidden
        className="pointer-events-none absolute -right-12 bottom-[14%] z-1 aspect-423/261 w-[clamp(300px,32vw,423px)] will-change-transform md:bottom-auto md:right-0 md:top-2/3 md:-translate-y-1/2"
      >
        <Image
          src={CLOUD_RIGHT_SRC}
          alt=""
          fill
          sizes="(max-width: 768px) 220px, 32vw"
          className="object-contain object-bottom-right"
        />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center gap-[clamp(1.5rem,3vw,2.5rem)] px-6"
      >
        <Image
          src={LOGO_SRC}
          alt="Thambalagama Estate"
          width={169}
          height={105}
          priority
          className="h-auto w-[clamp(140px,10vw,220px)]"
        />

        <Paragraph className="text-center text-cream">
          For the full experience, turn on your sound.
        </Paragraph>

        <GlassyButton type="button" onClick={handleEnter} disabled={isAnimating}>
          Enter the sanctuary
        </GlassyButton>
      </div>
    </section>
  );
}
