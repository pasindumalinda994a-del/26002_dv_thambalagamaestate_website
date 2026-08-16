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
  type ReactNode,
  type RefObject,
} from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { useNearViewport } from "@/lib/use-near-viewport";
import { Button } from "../components/Button";
import { H2 } from "../components/H2";
import {
  HoverHeadingReveal,
  type HoverHeadingRevealHandle,
} from "../components/HoverHeadingReveal";
import { Paragraph } from "../components/Paragraph";

const HOVER_GROW = 2.4;
const SHRINK_GROW = 0.45;
const REST_GROW = 1;
const HOVER_DURATION = 0.6;
const HOVER_EASE = "power3.out";
const HOVER_PARALLAX = 0.5;
const TEXT_REVEAL_DELAY = 0.38;
const OVERLAY_FADE_DURATION = 0.9;
const OVERLAY_HIDE_DURATION = 0.4;
const OVERLAY_EASE = "power2.out";
const OVERLAY_HIDE_EASE = "power2.inOut";

type ExperienceImage = {
  src: string;
  alt: string;
  heading?: ReactNode;
  caption?: string;
};

const EXPERIENCE_IMAGES: ExperienceImage[] = [
  {
    src: "/homepageimages/experience-waterfall-pools.webp",
    alt: "Cascading waterfall over dark rocks surrounded by lush rainforest",
    heading: "Forest bathing by private waterfalls and pools.",
  },
  {
    src: "/homepageimages/experience-guided-trails.webp",
    alt: "Hikers walking along a forest trail with lush greenery",
    heading: "Guided trails through the estate and Sinharaja.",
  },
  {
    src: "/homepageimages/experience-private-dining.webp",
    alt: "Private chef grilling skewers and corn over an outdoor barbecue",
    heading: "Bespoke dining prepared by a private chef.",
  },
];

function ExperienceImageCaption({
  heading,
  caption,
  showOnHover = true,
  overlayRef,
  headingRef,
}: {
  heading?: ReactNode;
  caption?: string;
  showOnHover?: boolean;
  overlayRef?: (el: HTMLDivElement | null) => void;
  headingRef?: (el: HoverHeadingRevealHandle | null) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        ref={overlayRef}
        aria-hidden
        className={[
          "absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,12,0.82)_0%,rgba(8,10,12,0.52)_24%,rgba(8,10,12,0.2)_48%,rgba(8,10,12,0.06)_70%,transparent_90%)]",
          showOnHover
            ? "opacity-0 motion-reduce:group-hover:opacity-100"
            : "opacity-100",
        ].join(" ")}
      />
      <div className="absolute inset-0 flex items-end justify-start p-4 md:p-6">
        {heading ? (
          <HoverHeadingReveal
            ref={headingRef}
            as="h2"
            enabled={showOnHover}
            className="max-w-[min(48rem,96%)] font-space-grotesk text-[clamp(24px,6.15vw,54px)] font-bold uppercase leading-[130%] tracking-[0.2px] text-cream"
          >
            {heading}
          </HoverHeadingReveal>
        ) : caption ? (
          <Paragraph className="max-w-[min(32rem,92%)] text-left text-cream">
            {caption}
          </Paragraph>
        ) : null}
      </div>
    </div>
  );
}

function ExperienceMobileCarousel({
  slides,
}: {
  slides: ExperienceImage[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef<number | null>(null);

  const syncActiveIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) return;

    const index = Math.round(container.scrollLeft / container.clientWidth);
    const next = Math.min(Math.max(index, 0), slides.length - 1);
    // Only re-render when the slide actually changes.
    setActiveIndex((prev) => (prev === next ? prev : next));
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
    setActiveIndex((prev) => (prev === index ? prev : index));
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
              quality={75}
            />
            <ExperienceImageCaption
              heading={slide.heading}
              caption={slide.caption}
              showOnHover={false}
            />
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
};

export const ExperienceSection = forwardRef<HTMLElement, ExperienceSectionProps>(
  function ExperienceSection({ overlayTargetRef }, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const darkOverlayRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const imageWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
    const captionOverlayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const captionHeadingRefs = useRef<(HoverHeadingRevealHandle | null)[]>(
      [],
    );
    const armed = useNearViewport(sectionRef);

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
      if (!armed) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const overlay = darkOverlayRef.current;
        if (!overlay) return;

        gsap.set(overlay, { opacity: 0 });

        const revealTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "bottom bottom",
            end: () => `+=${window.innerHeight}`,
            pin: sectionRef.current,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: ST_PRIORITY.experience,
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
        refreshScrollTriggers(150);
      });
      if (overlayEl) resizeObserver.observe(overlayEl);

      refreshScrollTriggers();

      return () => {
        resizeObserver.disconnect();
        ctx.revert();
      };
    }, [overlayTargetRef, armed]);

    useEffect(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(max-width: 767px)").matches) return;

      const grid = gridRef.current;
      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      const imageWraps = imageWrapRefs.current.filter(
        Boolean,
      ) as HTMLDivElement[];
      if (!grid || panels.length === 0 || imageWraps.length !== panels.length)
        return;

      let cancelled = false;
      let timeline: gsap.core.Timeline | null = null;
      let imageWrapWidth = 0;
      let resizeObserver: ResizeObserver | null = null;
      let ctx: gsap.Context | undefined;

      const syncImageWidths = () => {
        const maxGrowSum =
          HOVER_GROW + SHRINK_GROW * (panels.length - 1);
        imageWrapWidth =
          (grid.clientWidth * HOVER_GROW) / maxGrowSum;
        imageWraps.forEach((wrap) => {
          wrap.style.width = `${imageWrapWidth}px`;
        });
      };

      const animateToHovered = (index: number) => {
        timeline?.kill();
        const tl = gsap.timeline();

        panels.forEach((panel, i) => {
          const isActive = i === index;
          tl.to(
            panel,
            {
              flexGrow: isActive ? HOVER_GROW : SHRINK_GROW,
              duration: HOVER_DURATION,
              ease: HOVER_EASE,
            },
            0,
          );

          const wrap = imageWraps[i];
          if (wrap) {
            const drift = Math.max(-1.5, Math.min(1.5, index - i));
            const shift = isActive
              ? 0
              : drift * HOVER_PARALLAX * imageWrapWidth * 0.06;
            tl.to(
              wrap,
              {
                xPercent: -50,
                x: shift,
                duration: HOVER_DURATION,
                ease: HOVER_EASE,
              },
              0,
            );
          }

          const overlay = captionOverlayRefs.current[i];
          const heading = captionHeadingRefs.current[i];

          if (!isActive) {
            heading?.hide();
            if (overlay) {
              tl.to(
                overlay,
                {
                  opacity: 0,
                  duration: OVERLAY_HIDE_DURATION,
                  ease: OVERLAY_HIDE_EASE,
                },
                0,
              );
            }
          }
        });

        const activeOverlay = captionOverlayRefs.current[index];
        captionHeadingRefs.current[index]?.play({ delay: TEXT_REVEAL_DELAY });

        if (activeOverlay) {
          tl.to(
            activeOverlay,
            {
              opacity: 1,
              duration: OVERLAY_FADE_DURATION,
              ease: OVERLAY_EASE,
            },
            TEXT_REVEAL_DELAY,
          );
        }

        timeline = tl;
      };

      const animateToRest = () => {
        timeline?.kill();
        const tl = gsap.timeline();

        panels.forEach((panel, i) => {
          tl.to(
            panel,
            {
              flexGrow: REST_GROW,
              duration: HOVER_DURATION,
              ease: HOVER_EASE,
            },
            0,
          );

          const wrap = imageWraps[i];
          if (wrap) {
            tl.to(
              wrap,
              {
                xPercent: -50,
                x: 0,
                duration: HOVER_DURATION,
                ease: HOVER_EASE,
              },
              0,
            );
          }

          const overlay = captionOverlayRefs.current[i];
          captionHeadingRefs.current[i]?.hide();

          if (overlay) {
            tl.to(
              overlay,
              {
                opacity: 0,
                duration: OVERLAY_HIDE_DURATION,
                ease: OVERLAY_HIDE_EASE,
              },
              0,
            );
          }
        });

        timeline = tl;
      };

      const setup = () => {
        if (cancelled || !grid) return;

        syncImageWidths();
        resizeObserver = new ResizeObserver(syncImageWidths);
        resizeObserver.observe(grid);

        ctx = gsap.context(() => {
          gsap.set(panels, {
            flexGrow: REST_GROW,
            flexShrink: 1,
            flexBasis: 0,
          });
          gsap.set(imageWraps, { xPercent: -50, x: 0 });

          panels.forEach((_, index) => {
            const overlay = captionOverlayRefs.current[index];
            if (overlay) gsap.set(overlay, { opacity: 0 });
          });

          panels.forEach((panel, index) => {
            panel.addEventListener("mouseenter", () => animateToHovered(index));
          });
          grid.addEventListener("mouseleave", animateToRest);
        }, grid);
      };

      const fonts = document.fonts;
      if (fonts?.status === "loaded") {
        setup();
      } else if (fonts?.ready) {
        fonts.ready.then(setup);
      } else {
        setup();
      }

      return () => {
        cancelled = true;
        timeline?.kill();
        resizeObserver?.disconnect();
        ctx?.revert();
      };
    }, []);

    return (
      <section
        ref={setSectionRef}
        aria-label="Estate experiences"
        className="relative z-30 flex min-h-screen flex-col justify-center overflow-hidden bg-cream md:-mt-[100vh] md:justify-start"
      >
        <div
          ref={darkOverlayRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-black opacity-0"
        />

        <div className="relative z-10 shrink-0 px-5 pt-12 pb-6 md:px-8 md:py-20">
          <div className="space-y-6">
            <H2
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
            <Button variant="dark" href="/experiences">
              Explore experiences
            </Button>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-col px-5 pb-12 md:flex-1 md:items-center md:justify-end md:px-8 md:pb-16">
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
                <div
                  ref={(el) => {
                    imageWrapRefs.current[index] = el;
                  }}
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 75vw, 100vw"
                    quality={75}
                  />
                </div>
                <ExperienceImageCaption
                  heading={image.heading}
                  caption={image.caption}
                  overlayRef={(el) => {
                    captionOverlayRefs.current[index] = el;
                  }}
                  headingRef={(el) => {
                    captionHeadingRefs.current[index] = el;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
);
