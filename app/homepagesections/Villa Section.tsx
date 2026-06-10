"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";

const BG_SRC = "/main%20images/Vila%20Section%20BG.webp";
const VILLA_BG_SPEED = 1.5;
const VILLA_FG_SPEED = 0.2;

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
      <div
        ref={imageRef}
        className="absolute inset-0 will-change-transform"
      >
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
        className="absolute inset-0 bg-deep-forest opacity-0 will-change-[opacity]"
      />
    </>
  );
}

function VillaGalleryCard({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative mx-auto h-[70vh] w-[min(calc(100vw-3rem),84rem)] shrink-0 overflow-hidden rounded-[clamp(20px,3vw,36px)] md:h-[82vh] md:w-[min(96vw,84rem)]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) calc(100vw - 3rem), 96vw"
        priority={priority}
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
  const galleryScrollDistanceRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
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
            return `+=${stripHeight + window.innerHeight}`;
          },
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const measureGallery = () => {
      if (!galleryStripRef.current || !spacerRef.current) return;

      const stripHeight = galleryStripRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      galleryScrollDistanceRef.current = stripHeight + viewportHeight;
      spacerRef.current.style.height = `${galleryScrollDistanceRef.current}px`;
      ScrollTrigger.refresh();
    };

    const updateParallax = () => {
      if (!sectionRef.current) {
        ticking = false;
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const revealHeight = viewportHeight;

      const rawProgress =
        (viewportHeight - rect.top) / (viewportHeight + revealHeight);
      const revealComplete = rect.top <= 0;
      const progressAtFullReveal = viewportHeight / (viewportHeight + revealHeight);
      const progress = revealComplete
        ? progressAtFullReveal
        : Math.max(0, Math.min(1, rawProgress));

      const centeredProgress = (progress - 0.5) * 2;
      const travelBase = centeredProgress * 240;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${travelBase * VILLA_BG_SPEED}px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${travelBase * VILLA_FG_SPEED}px, 0)`;
      }

      if (galleryRef.current && galleryStripRef.current) {
        const stripHeight = galleryStripRef.current.offsetHeight;
        const galleryScrollDistance = stripHeight + viewportHeight;
        const scrolledPastReveal = Math.max(0, -rect.top);
        const galleryProgress = revealComplete
          ? Math.min(1, scrolledPastReveal / galleryScrollDistance)
          : 0;

        const startY = viewportHeight;
        const endY = -stripHeight;
        const galleryY = startY + galleryProgress * (endY - startY);

        galleryRef.current.style.transform = `translate3d(0, ${galleryY}px, 0)`;
      }

      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    const onResize = () => {
      measureGallery();
      onScrollOrResize();
    };

    measureGallery();
    onScrollOrResize();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onResize);

    const strip = galleryStripRef.current;
    const resizeObserver =
      strip &&
      new ResizeObserver(() => {
        measureGallery();
        onScrollOrResize();
      });
    if (strip && resizeObserver) resizeObserver.observe(strip);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="Villa" className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
          <VillaBackground
            imageRef={bgImageRef}
            overlayRef={forestOverlayRef}
          />
        </div>

        <div
          ref={galleryRef}
          className="pointer-events-none absolute inset-0 z-5 will-change-transform"
        >
          <div
            ref={galleryStripRef}
            className="flex flex-col items-center gap-[8vh] md:gap-[10vh]"
          >
            {VILLA_GALLERY_IMAGES.map((image, index) => (
              <VillaGalleryCard
                key={image.src}
                src={image.src}
                alt={image.alt}
                priority={index === 0}
              />
            ))}
          </div>
        </div>

        <div
          ref={contentRef}
          className="absolute inset-0 z-10 will-change-transform"
        >
          <div className="relative z-10 flex min-h-screen flex-col items-start justify-end gap-6 px-[clamp(1.25rem,4vw,2rem)] pb-12 md:pb-16">
            <H2 className="max-w-6xl uppercase text-cream">
              Crafted for comfort,
              <br />
              surrounded by the wild.
            </H2>

            <Paragraph className="max-w-lg text-cream">
              Expansive private living spaces opening out to a 360-degree panoramic
              view.
            </Paragraph>

            <GlassyButton href="/bungalow">Tour the bungalow</GlassyButton>
          </div>
        </div>
      </div>

      <div ref={spacerRef} aria-hidden className="h-0" />
    </section>
  );
}
