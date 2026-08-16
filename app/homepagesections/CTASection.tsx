"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { useNearViewport } from "@/lib/use-near-viewport";
import { useBooking } from "../components/booking/BookingProvider";
import { Button } from "../components/Button";

const BG_SRC = "/homepageimages/cta-bg.webp";

const HEADLINE_CLASS =
  "w-full font-space-grotesk text-[clamp(24px,6.15vw,36px)] font-normal uppercase leading-[130%] tracking-[0.5px] text-cream";

const HEADLINE_HOLD = 0.08;
const HEADLINE_TRANSITION = 1;
const HEADLINE_EASE = "power1.inOut";
const WHEEL_RADIUS_SCALE = 3;

const CTA_HEADLINES: ReactNode[] = [
  <>
    <span className="font-space-grotesk font-light italic">Zero</span>{" "}
    <span className="font-space-grotesk">
      shared spaces or distractions.
    </span>
  </>,
  <>
    <span className="font-space-grotesk">Absolute,</span>{" "}
    <span className="font-space-grotesk font-light italic">
      uninterrupted privacy.
    </span>
  </>,
  <>
    <span className="font-space-grotesk font-light italic">Pure</span>{" "}
    <span className="font-space-grotesk">connection to the canopy.</span>
  </>,
];

function wrapAngle(deg: number) {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgContainerRef = useRef<HTMLDivElement>(null);
  const headlineRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const spokeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineWheelRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();
  const armed = useNearViewport(sectionRef);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!armed) return;

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
          refreshPriority: ST_PRIORITY.cta,
        },
      });

      const wheel = headlineWheelRef.current;
      const headlines = headlineRefs.current.filter(
        Boolean,
      ) as HTMLHeadingElement[];
      const spokes = spokeRefs.current.filter(Boolean) as HTMLDivElement[];

      if (wheel && headlines.length > 1 && spokes.length === headlines.length) {
        const n = headlines.length;
        const step = 360 / n;

        const layoutWheel = () => {
          const height = headlines[0].offsetHeight || 1;
          const radius =
            (height / (2 * Math.tan(Math.PI / n))) * WHEEL_RADIUS_SCALE;

          gsap.set(wheel, {
            transformStyle: "preserve-3d",
            transformOrigin: "50% 50%",
          });
          spokes.forEach((spoke, i) => {
            gsap.set(spoke, {
              rotationX: -i * step,
              transformOrigin: "50% 50%",
              transformStyle: "preserve-3d",
            });
          });
          headlines.forEach((headline) => {
            gsap.set(headline, {
              z: radius,
              backfaceVisibility: "hidden",
              transformOrigin: "50% 50%",
            });
          });
        };

        const updateFaces = () => {
          const wheelRot = Number(gsap.getProperty(wheel, "rotationX")) || 0;
          let nearest = 0;
          let nearestAbs = Infinity;

          headlines.forEach((headline, i) => {
            const angle = wrapAngle(-i * step + wheelRot);
            const abs = Math.abs(angle);
            gsap.set(headline, {
              opacity: gsap.utils.clamp(0, 1, 1 - abs / 90),
            });
            if (abs < nearestAbs) {
              nearestAbs = abs;
              nearest = i;
            }
          });

          headlines.forEach((headline, i) => {
            headline.setAttribute(
              "aria-hidden",
              i === nearest ? "false" : "true",
            );
          });
        };

        layoutWheel();
        gsap.set(wheel, { rotationX: 0 });
        updateFaces();

        const pinDuration =
          n * HEADLINE_HOLD + (n - 1) * HEADLINE_TRANSITION;

        const headlineTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * pinDuration}`,
            pin: section,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            id: "cta-headlines",
            invalidateOnRefresh: true,
            refreshPriority: ST_PRIORITY.cta,
            onRefresh: () => {
              layoutWheel();
              updateFaces();
            },
          },
          onUpdate: updateFaces,
        });

        for (let i = 1; i < n; i++) {
          headlineTl.to({}, { duration: HEADLINE_HOLD });
          headlineTl.to(wheel, {
            rotationX: step * i,
            duration: HEADLINE_TRANSITION,
            ease: HEADLINE_EASE,
          });
        }
        headlineTl.to({}, { duration: HEADLINE_HOLD });

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
              refreshPriority: ST_PRIORITY.cta,
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
              refreshPriority: ST_PRIORITY.cta,
            },
          },
        );
      }
    }, section);

    refreshScrollTriggers();

    return () => ctx.revert();
  }, [armed]);

  return (
    <section
      ref={sectionRef}
      aria-label="Call to action"
      data-ambient-zone="locationCta"
      className="relative z-[32] flex min-h-screen items-center justify-center overflow-hidden bg-deep-forest"
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div ref={bgContainerRef} className="absolute inset-0">
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

          <div className="relative my-[80px] w-full perspective-[800px] md:perspective-[1000px]">
            <h2 aria-hidden className={`invisible ${HEADLINE_CLASS}`}>
              {CTA_HEADLINES[0]}
            </h2>

            <div
              ref={headlineWheelRef}
              className="absolute inset-0 [transform-style:preserve-3d]"
            >
              {CTA_HEADLINES.map((content, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    spokeRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 top-0 [transform-style:preserve-3d]"
                >
                  <h2
                    ref={(el) => {
                      headlineRefs.current[i] = el;
                    }}
                    className={`${HEADLINE_CLASS} [backface-visibility:hidden] ${
                      i === 0 ? "" : "opacity-0"
                    }`}
                    aria-hidden={i !== 0}
                  >
                    {content}
                  </h2>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button variant="glass" onClick={openBooking}>Check Availability</Button>
      </div>
    </section>
  );
}
