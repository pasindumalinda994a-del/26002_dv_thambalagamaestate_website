"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";

const BG_SRC = "/main%20images/Vila%20Section%20BG.webp";

const GALLERY_IMAGES = [
  "/main%20images/Villa%20Image%201.webp",
  "/main%20images/Villa%20Image%202.webp",
  "/main%20images/Villa%20Image%203.webp",
  "/main%20images/Villa%20Image%204.webp",
];

export function VillaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!sectionRef.current || !stripRef.current || !overlayRef.current) return;

    const aboutSection = sectionRef.current.previousElementSibling;
    if (!aboutSection || aboutSection.getAttribute("aria-label") !== "About") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(stripRef.current, { y: "100svh" });
      gsap.set(overlayRef.current, { opacity: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: aboutSection,
            start: "bottom top",
            endTrigger: sectionRef.current,
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(stripRef.current, { y: "100svh", duration: 1, ease: "none" })
        .to(stripRef.current, { y: "0", duration: 1, ease: "none" })
        .to(stripRef.current, { y: "-100svh", duration: 1, ease: "none" })
        .to(stripRef.current, { y: "-200svh", duration: 1, ease: "none" })
        .to(stripRef.current, { y: "-300svh", duration: 1, ease: "none" })
        .to(stripRef.current, { y: "-400svh", duration: 1, ease: "none" })
        .to(
          overlayRef.current,
          { opacity: 1, duration: 5, ease: "none" },
          1,
        );
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Villa"
      className="relative h-[600svh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-screen w-full motion-reduce:relative motion-reduce:min-h-screen">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${BG_SRC}")` }}
        />

        <div
          ref={overlayRef}
          aria-hidden
          className="absolute inset-0 z-5 bg-forest-green opacity-0"
        />

        <div className="absolute inset-0 z-10 overflow-hidden">
          <div
            ref={stripRef}
            className="flex flex-col gap-64 px-6 will-change-transform md:px-64"
            style={{ transform: "translateY(100svh)" }}
          >
            {GALLERY_IMAGES.map((src, index) => (
              <div
                key={index}
                aria-hidden
                className="h-[calc(100svh-16rem)] w-full shrink-0 rounded-[25px] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${src}")` }}
              />
            ))}
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-0 z-20 bg-linear-to-t from-black/20 to-transparent"
        />

        <div className="relative z-30 flex h-full flex-col items-start justify-end gap-6 px-6 pb-12 md:px-16 md:pb-16">
          <H2 className="max-w-6xl uppercase text-cream">
            Crafted for comfort,
            <br />
            surrounded by the wild.
          </H2>

          <Paragraph className="max-w-lg text-cream">
            Expansive private living spaces opening out to a 360-degree
            panoramic view.
          </Paragraph>

          <GlassyButton href="/bungalow">
            Tour the bungalow
          </GlassyButton>
        </div>
      </div>
    </section>
  );
}
