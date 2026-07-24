"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { useBooking } from "../components/booking/BookingProvider";
import { GlassyButton } from "../components/GlassyButton";
import {
  ensureScrollTriggerConfig,
  refreshScrollTriggers,
} from "@/lib/scroll-refresh";
const BG_SRC = "/main%20images/CTA%20Section%20Bg.webp";

const HEADLINE_CLASS =
  "w-full font-space-grotesk text-[clamp(24px,6.15vw,36px)] font-normal uppercase leading-[130%] tracking-[0.5px] text-cream";

const WHEEL_ACTIVE = { rotationX: 0, y: 0, z: 0, opacity: 1 };
const WHEEL_ENTER = { rotationX: 60, y: 100, z: -120, opacity: 0 };
const WHEEL_EXIT = { rotationX: -60, y: -100, z: -120, opacity: 0 };

const CTA_HEADLINES: ReactNode[] = [
  <>
    <span className="font-space-grotesk font-light italic">Zero</span>{" "}
    <span className="font-space-grotesk">
      shared spaces or distractions.
    </span>
  </>,
  <>
    <span className="font-space-grotesk">Absolute,</span>{" "}
    <span className="font-space-grotesk font-light italic">uninterrupted privacy.</span>
  </>,
  <>
    <span className="font-space-grotesk font-light italic">Pure</span>{" "}
    <span className="font-space-grotesk">connection to the canopy.</span>
  </>,
];

type CTASectionProps = {
  ready?: boolean;
};

export function CTASection({ ready = true }: CTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgContainerRef = useRef<HTMLDivElement>(null);
  const headlineRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const headlineWheelRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();

  useLayoutEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const bgContainer = bgContainerRef.current;
    if (!section || !bgContainer) return;

    ensureScrollTriggerConfig();

    const ctx = gsap.context(() => {
      gsap.set(bgContainer, {
        transformOrigin: "center center",
        scale: 0.5,
      });

      gsap.to(bgContainer, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const headlines = headlineRefs.current.filter(
        Boolean,
      ) as HTMLHeadingElement[];
      if (headlines.length > 1) {
        const wheel = headlineWheelRef.current;
        if (wheel) {
          gsap.set(wheel, { transformStyle: "preserve-3d" });
        }

        headlines.forEach((headline, i) => {
          gsap.set(headline, {
            top: 0,
            transformOrigin: "50% 50%",
            ...(i === 0 ? WHEEL_ACTIVE : WHEEL_ENTER),
          });
        });

        const transitionCount = headlines.length - 1;
        const headlineTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * transitionCount}`,
            pin: section,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            id: "cta-headlines",
            invalidateOnRefresh: true,
          },
        });

        for (let i = 1; i < headlines.length; i++) {
          headlineTl
            .to(headlines[i - 1], {
              ...WHEEL_EXIT,
              ease: "none",
              duration: 1,
            })
            .fromTo(
              headlines[i],
              WHEEL_ENTER,
              { ...WHEEL_ACTIVE, ease: "none", duration: 1 },
              "<",
            );
        }

        gsap.fromTo(
          bgContainer,
          { scale: 1 },
          {
            scale: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: () =>
                ScrollTrigger.getById("cta-headlines")?.end ?? "top top",
              end: () => `+=${window.innerHeight}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      } else {
        gsap.fromTo(
          bgContainer,
          { scale: 1 },
          {
            scale: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, section);

    refreshScrollTriggers();

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      aria-label="Call to action"
      className="relative z-[32] flex min-h-screen items-center justify-center overflow-hidden bg-deep-forest"
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          ref={bgContainerRef}
          className="absolute inset-0"
        >
          <Image
            src={BG_SRC}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            onLoad={() => refreshScrollTriggers()}
          />
          <div aria-hidden className="absolute inset-0 bg-black/29" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 text-center md:gap-10">
        <div className="flex w-full flex-col items-center gap-2">
          <p className="font-secondary text-[16px] font-normal uppercase leading-[150%] tracking-[0.2px] text-cream">
            The Estate Promise
          </p>

          <div className="relative my-[80px] w-full perspective-[1000px]">
            <h2 aria-hidden className={`invisible ${HEADLINE_CLASS}`}>
              {CTA_HEADLINES[0]}
            </h2>

            <div
              ref={headlineWheelRef}
              className="absolute inset-0 [transform-style:preserve-3d]"
            >
              {CTA_HEADLINES.map((content, i) => (
                <h2
                  key={i}
                  ref={(el) => {
                    headlineRefs.current[i] = el;
                  }}
                  className={`absolute inset-x-0 top-0 ${HEADLINE_CLASS}`}
                  aria-hidden={i !== 0}
                >
                  {content}
                </h2>
              ))}
            </div>
          </div>
        </div>

        <GlassyButton onClick={openBooking}>Check Availability</GlassyButton>
      </div>
    </section>
  );
}
