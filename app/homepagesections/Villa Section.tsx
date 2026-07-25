"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";

const BG_SRC = "/main%20images/Vila%20Section%20BG.webp";
const VILLA_BG_TRAVEL = 360; // 240 * 1.5
const VILLA_FG_TRAVEL = 48; // 240 * 0.2
const MOBILE_MQ = "(max-width: 767px)";

const VILLA_GALLERY_IMAGES = [
  { src: "/main%20images/Villa%20Image%201.webp", alt: "Villa interior view 1" },
  { src: "/main%20images/Villa%20Image%202.webp", alt: "Villa interior view 2" },
  { src: "/main%20images/Villa%20Image%203.webp", alt: "Villa interior view 3" },
  { src: "/main%20images/Villa%20Image%204.webp", alt: "Villa interior view 4" },
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
          className="object-cover"
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
    <div className="relative mx-auto h-[70vh] w-[min(calc(100vw-2rem),84rem)] shrink-0 overflow-hidden md:h-[82vh] md:w-[min(96vw,84rem)]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) calc(100vw - 2rem), 96vw"
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

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const mobileQuery = window.matchMedia(MOBILE_MQ);

    const measureGallery = () => {
      if (!galleryStripRef.current || !spacerRef.current) return;

      const stripHeight = galleryStripRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      spacerRef.current.style.height = `${stripHeight + viewportHeight}px`;
    };

    const scheduleRefresh = () => {
      measureGallery();
      refreshScrollTriggers();
    };

    measureGallery();

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
          end: () => {
            const stripHeight = galleryStripRef.current?.offsetHeight ?? 0;
            return `+=${(stripHeight + window.innerHeight) * 0.2}`;
          },
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
            y: () => -(galleryStripRef.current?.offsetHeight ?? 0),
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => {
                const stripHeight = galleryStripRef.current?.offsetHeight ?? 0;
                return `+=${stripHeight + window.innerHeight}`;
              },
              scrub: true,
              invalidateOnRefresh: true,
              refreshPriority: ST_PRIORITY.villa,
            },
          },
        );
      }
    }, sectionRef);

    const strip = galleryStripRef.current;
    const resizeObserver =
      strip &&
      new ResizeObserver(() => {
        scheduleRefresh();
      });
    if (strip && resizeObserver) resizeObserver.observe(strip);

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
  }, []);

  return (
    <section ref={sectionRef} aria-label="Villa" className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
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

        <div ref={contentRef} className="absolute inset-0 z-10">
          <div className="relative z-10 flex min-h-screen flex-col items-start justify-end pl-4 pb-[78px] md:pl-8 md:pb-[94px]">
            <H2 className="max-w-6xl uppercase text-cream">
              Crafted for comfort,
              <br />
              surrounded by the wild.
            </H2>

            <Paragraph className="mt-2 max-w-lg text-cream md:mt-4">
              Expansive private living spaces opening out to a 360-degree
              panoramic view.
            </Paragraph>

            <GlassyButton className="mt-10" href="/bungalow">
              Tour the bungalow
            </GlassyButton>
          </div>
        </div>
      </div>

      <div ref={spacerRef} aria-hidden className="h-0" />
    </section>
  );
}
