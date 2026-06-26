"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Button } from "../components/SolidButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";
import { getStackRevealDistance } from "./stackScroll";

const HOVER_GROW = 2.4;
const SHRINK_GROW = 0.45;
const REST_GROW = 1;
const HOVER_DURATION = 0.7;
const HOVER_EASE = "power3.inOut";

const EXPERIENCE_IMAGES = [
  {
    src: "/main%20images/Experience%20Image%204.jpg",
    alt: "Silky waterfall cascading over mossy rocks in the forest",
    caption:
      "Secluded cascades and natural pools, reserved entirely for estate guests.",
  },
  {
    src: "/main%20images/Experience%20Image%205.jpg",
    alt: "Curated estate dining spread with rice and local dishes",
    caption:
      "Curated menus shaped around local harvests and your own preferences.",
  },
  {
    src: "/main%20images/Experience%20Image%206.jpg",
    alt: "Wildlife photographer with a telephoto lens in the jungle",
    caption:
      "Guided forest walks for birders, photographers, and quiet observation.",
  },
] as const;

function ExperienceImageCaption({
  caption,
  showOnHover = true,
}: {
  caption: string;
  showOnHover?: boolean;
}) {
  return (
    <div
      className={[
        "pointer-events-none absolute inset-0 flex items-end justify-start bg-linear-to-t from-black/60 via-black/15 to-transparent p-[clamp(1rem,2.5vw,1.5rem)] transition-opacity duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]",
        showOnHover ? "opacity-0 group-hover:opacity-100" : "opacity-100",
      ].join(" ")}
    >
      <Paragraph className="max-w-[min(32rem,92%)] text-left text-cream">
        {caption}
      </Paragraph>
    </div>
  );
}

function ExperienceMobileCarousel({
  slides,
}: {
  slides: typeof EXPERIENCE_IMAGES;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) return;

    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }, [slides.length]);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      syncActiveIndex();
    });
  }, [syncActiveIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4 md:hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            aria-hidden={index !== activeIndex}
            className="group relative aspect-4/4 w-full shrink-0 snap-center snap-always overflow-hidden"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
            <ExperienceImageCaption caption={slide.caption} showOnHover={false} />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2" role="tablist" aria-label="Experience slides">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollToIndex(index)}
            className={`h-0.5 w-8 rounded-full transition-colors ${
              index === activeIndex ? "bg-forest-green" : "bg-forest-green/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type ExperienceSectionProps = {
  overlayTargetRef?: RefObject<HTMLElement | null>;
  overlayReady?: boolean;
};

export const ExperienceSection = forwardRef<HTMLElement, ExperienceSectionProps>(
  function ExperienceSection(
    { overlayTargetRef, overlayReady = true },
    ref,
  ) {
    const sectionRef = useRef<HTMLElement>(null);
    const darkOverlayRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

    const setSectionRef = (node: HTMLElement | null) => {
      sectionRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useLayoutEffect(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion || !overlayTargetRef) return;
      if (!overlayReady) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const overlay = darkOverlayRef.current;
        if (!overlay) return;

        gsap.set(overlay, { opacity: 0 });

        const revealTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "bottom bottom",
            end: () => `+=${getStackRevealDistance()}`,
            pin: sectionRef.current,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        revealTimeline.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: 0.8 },
          0.2,
        );
      }, sectionRef);

      const overlayEl = overlayTargetRef.current;
      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      if (overlayEl) resizeObserver.observe(overlayEl);

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        resizeObserver.disconnect();
        ctx.revert();
      };
    }, [overlayTargetRef, overlayReady]);

    useEffect(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(max-width: 767px)").matches) return;

      const grid = gridRef.current;
      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!grid || panels.length === 0) return;

      const tweenDefaults = {
        duration: HOVER_DURATION,
        ease: HOVER_EASE,
        overwrite: "auto" as const,
      };

      const animateToHovered = (index: number) => {
        gsap.to(panels, {
          ...tweenDefaults,
          flexGrow: (i) => (i === index ? HOVER_GROW : SHRINK_GROW),
        });
      };

      const animateToRest = () => {
        gsap.to(panels, {
          ...tweenDefaults,
          flexGrow: REST_GROW,
        });
      };

      const ctx = gsap.context(() => {
        gsap.set(panels, {
          flexGrow: REST_GROW,
          flexShrink: 1,
          flexBasis: 0,
        });

        panels.forEach((panel, index) => {
          panel.addEventListener("mouseenter", () => animateToHovered(index));
        });
        grid.addEventListener("mouseleave", animateToRest);
      }, grid);

      return () => ctx.revert();
    }, []);

    return (
      <section
        ref={setSectionRef}
        aria-label="Estate experiences"
        className="relative -mt-[100svh] z-30 flex min-h-screen flex-col overflow-hidden bg-cream"
      >
        <div
          ref={darkOverlayRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-black will-change-[opacity]"
        />

        <div className="relative z-10 shrink-0 px-[clamp(1.25rem,4vw,2rem)] py-[clamp(3rem,8vw,5rem)]">
          <div className="space-y-6">
            <H2
              ready={overlayReady}
              triggerRef={sectionRef}
              triggerStart="top 82%"
              className="uppercase text-forest-green"
            >
              THE ESTATE EXPERIENCES
            </H2>
            <Paragraph className="max-w-2xl text-forest-green">
              A private rhythm of secluded waters, guided wilderness, and
              personalized dining.
            </Paragraph>
            <Button variant="onCream" href="/experiences">
              Explore experiences
            </Button>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-[clamp(1.25rem,4vw,2rem)] pb-[clamp(2.5rem,6vw,4rem)] md:items-center">
          <ExperienceMobileCarousel slides={EXPERIENCE_IMAGES} />

          <div
            ref={gridRef}
            className="hidden aspect-15/7 w-full gap-0 md:flex"
          >
            {EXPERIENCE_IMAGES.map((image, index) => (
              <div
                key={index}
                ref={(el) => {
                  panelRefs.current[index] = el;
                }}
                aria-hidden
                className="experience-panel group relative h-full min-w-0 overflow-hidden"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
                <ExperienceImageCaption caption={image.caption} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
);
