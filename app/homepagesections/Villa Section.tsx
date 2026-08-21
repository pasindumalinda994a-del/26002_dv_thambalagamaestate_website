"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { useNearViewport } from "@/lib/use-near-viewport";
import { Button } from "../components/Button";
import { H2 } from "../components/H2";
import { PinnedScrollHint } from "../components/PinnedScrollHint";

const BG_SRC = "/home/villa-bg.webp";
const VILLA_BG_TRAVEL = 360; // 240 * 1.5
const VILLA_FG_TRAVEL = 48; // 240 * 0.2
const MOBILE_MQ = "(max-width: 767px)";

const VILLA_FEATURES = [
  "Private bungalow",
  "Rainforest views",
  "Up to 18 guests",
  "Sri Lanka",
] as const;

const VILLA_GALLERY_IMAGES = [
  {
    src: "/home/0C8A9859.JPG",
    alt: "Villa bedroom with balcony and mountain views",
  },
  {
    src: "/home/0C8A9902.JPG",
    alt: "Villa bedroom with twin beds",
  },
  {
    src: "/home/0C8A0117.JPG",
    alt: "Villa living room with forest views",
  },
  {
    src: "/home/0C8A0121.JPG",
    alt: "Villa dining room with forest views",
  },
  {
    src: "/home/0C8A9920.JPG",
    alt: "Villa dining and living area opening to the forest balcony",
  },
  {
    src: "/home/0C8A0018.JPG",
    alt: "Villa outdoor dining patio at night with fairy lights",
  },
] as const;

function VillaBackground({
  imageRef,
  overlayRef,
}: {
  imageRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src={BG_SRC}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[75%_center] md:object-center"
        />
      </div>
      <div aria-hidden className="absolute inset-0 bg-black/29" />
      <div
        ref={overlayRef}
        aria-hidden
        className="absolute inset-0 bg-deep-forest opacity-0"
      />
    </>
  );
}

function VillaGalleryCard({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-[min(calc(100vw-2rem),84rem)] shrink-0 overflow-hidden md:aspect-[3/2] md:w-[min(calc(100vw-10rem),76rem)]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) calc(100vw - 2rem), calc(100vw - 10rem)"
      />
    </div>
  );
}

export function VillaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const forestOverlayRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryStripRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const armed = useNearViewport(sectionRef);

  useLayoutEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_MQ);

    const getGalleryScrollDistance = () => {
      const stripHeight = galleryStripRef.current?.offsetHeight ?? 0;
      // End when the last image's bottom reaches mid-viewport (no empty tail).
      return stripHeight + window.innerHeight * 0.5;
    };

    const measureGallery = () => {
      if (!spacerRef.current) return;
      spacerRef.current.style.height = `${getGalleryScrollDistance()}px`;
    };

    const scheduleRefresh = () => {
      measureGallery();
      refreshScrollTriggers();
    };

    measureGallery();

    const strip = galleryStripRef.current;
    const resizeObserver =
      strip &&
      new ResizeObserver(() => {
        if (armed) scheduleRefresh();
        else measureGallery();
      });
    if (strip && resizeObserver) resizeObserver.observe(strip);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => resizeObserver?.disconnect();
    }

    if (!armed) {
      return () => resizeObserver?.disconnect();
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const isMobile = mobileQuery.matches;

      gsap.set(bgImageRef.current, {
        transformOrigin: "center center",
        scale: 1.2,
      });

      gsap.to(bgImageRef.current, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
          refreshPriority: ST_PRIORITY.villa,
        },
      });

      gsap.set(forestOverlayRef.current, { opacity: 0 });

      gsap.to(forestOverlayRef.current, {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${getGalleryScrollDistance() * 0.2}`,
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: ST_PRIORITY.villa,
        },
      });

      // Desktop-only approach parallax (no separate window scroll loop).
      if (!isMobile) {
        const approachTrigger = {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: ST_PRIORITY.villa,
        };

        if (bgRef.current) {
          gsap.fromTo(
            bgRef.current,
            { y: -VILLA_BG_TRAVEL },
            { y: 0, ease: "none", scrollTrigger: approachTrigger },
          );
        }
        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { y: -VILLA_FG_TRAVEL },
            {
              y: 0,
              ease: "none",
              scrollTrigger: { ...approachTrigger },
            },
          );
        }
      } else {
        gsap.set([bgRef.current, contentRef.current].filter(Boolean), { y: 0 });
      }

      // Gallery scroll-through — required on all breakpoints (sticky + spacer).
      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current,
          { y: () => window.innerHeight },
          {
            y: () =>
              window.innerHeight * 0.5 -
              (galleryStripRef.current?.offsetHeight ?? 0),
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${getGalleryScrollDistance()}`,
              scrub: true,
              invalidateOnRefresh: true,
              refreshPriority: ST_PRIORITY.villa,
            },
          },
        );
      }
    }, sectionRef);

    const onBreakpointChange = () => {
      scheduleRefresh();
    };
    mobileQuery.addEventListener("change", onBreakpointChange);

    measureGallery();
    refreshScrollTriggers();

    return () => {
      mobileQuery.removeEventListener("change", onBreakpointChange);
      resizeObserver?.disconnect();
      ctx.revert();
    };
  }, [armed]);

  return (
    <section
      id="villa"
      ref={sectionRef}
      aria-label="Villa"
      data-ambient-zone="villa"
      className="relative bg-deep-forest"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-deep-forest">
        <div ref={bgRef} className="absolute inset-0 z-0">
          <VillaBackground
            imageRef={bgImageRef}
            overlayRef={forestOverlayRef}
          />
        </div>

        <div
          ref={galleryRef}
          className="pointer-events-none absolute inset-0 z-5"
        >
          <div
            ref={galleryStripRef}
            className="flex flex-col items-center gap-[8vh] md:gap-[10vh]"
          >
            {VILLA_GALLERY_IMAGES.map((image) => (
              <VillaGalleryCard
                key={image.src}
                src={image.src}
                alt={image.alt}
              />
            ))}
          </div>
        </div>

        <PinnedScrollHint
          triggerRef={sectionRef}
          end={() => `+=${spacerRef.current?.offsetHeight ?? 0}`}
          refreshPriority={ST_PRIORITY.villa}
          enabled={armed}
          className="absolute inset-x-0 top-[18%] z-15 flex justify-center md:top-[22%]"
        />

        <div ref={contentRef} className="absolute inset-0 z-10">
          <div className="relative z-10 flex min-h-screen flex-col justify-end gap-10 px-4 pb-[78px] md:flex-row md:items-end md:justify-between md:gap-8 md:px-8 md:pb-[94px]">
            <div className="flex flex-col items-start">
              <H2 className="max-w-6xl uppercase text-cream">
                Crafted for comfort.
              </H2>

              <Button variant="glass" className="mt-8 md:mt-10" href="/bungalow">
                Tour the bungalow
              </Button>
            </div>

            <ul
              aria-label="Villa highlights"
              className="hidden flex-wrap gap-x-6 gap-y-2 md:flex md:justify-end md:gap-x-8"
            >
              {VILLA_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="font-secondary text-xs font-medium uppercase tracking-[0.15em] text-cream md:text-[13px]"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div ref={spacerRef} aria-hidden className="h-0" />
    </section>
  );
}
