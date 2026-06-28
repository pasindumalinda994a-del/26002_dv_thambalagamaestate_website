"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { GlassyButton } from "../components/GlassyButton";

const BG_SRC = "/main%20images/CTA%20Section%20Bg.png";

const HEADLINE_CLASS =
  "w-full font-primary text-[clamp(24px,6.15vw,36px)] font-normal uppercase leading-[130%] tracking-[0.5px] text-cream backface-hidden";

const WHEEL_ACTIVE = { rotationX: 0, y: 0, z: 0, opacity: 1 };
const WHEEL_ENTER = { rotationX: 60, y: 100, z: -120, opacity: 0 };
const WHEEL_EXIT = { rotationX: -60, y: -100, z: -120, opacity: 0 };

const CTA_HEADLINES: ReactNode[] = [
  <>
    <span className="font-secondary font-light italic">Zero</span>{" "}
    <span className="font-primary">
      shared spaces or distractions.
    </span>
  </>,
  <>
    <span className="font-primary">Absolute,</span>{" "}
    <span className="font-secondary font-light italic">uninterrupted privacy.</span>
  </>,
  <>
    <span className="font-secondary font-light italic">Pure</span>{" "}
    <span className="font-primary">connection to the canopy.</span>
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

  useLayoutEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const bgContainer = bgContainerRef.current;
    if (!section || !bgContainer) return;

    gsap.registerPlugin(ScrollTrigger);

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
            force3D: true,
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

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

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
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={BG_SRC}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            onLoad={() => ScrollTrigger.refresh()}
          />
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
                  className={`absolute inset-x-0 top-0 ${HEADLINE_CLASS} will-change-transform`}
                  aria-hidden={i !== 0}
                >
                  {content}
                </h2>
              ))}
            </div>
          </div>
        </div>

        <GlassyButton href="/book">Check Availability</GlassyButton>
      </div>
    </section>
  );
}
