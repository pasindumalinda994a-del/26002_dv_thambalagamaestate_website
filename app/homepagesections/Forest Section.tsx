"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { refreshScrollTriggers, ST_PRIORITY } from "@/lib/scroll-refresh";
import { useNearViewport } from "@/lib/use-near-viewport";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";

const FOREST_CTA = {
  label: "Explore the forest",
  href: "/forest",
} as const;

const SLIDES = [
  {
    bg: "/homepageimages/forest-slide-estate-bg.webp",
    heading: (
      <>
        An exclusive estate bordering
        <br />
        the UNESCO Sinharaja
        <br />
        Rainforest.
      </>
    ),
  },
  {
    bg: "/homepageimages/forest-slide-waterfalls-bg.webp",
    heading: (
      <>
        Two private waterfalls
        <br />
        and a natural jungle pool.
      </>
    ),
  },
  {
    bg: "/homepageimages/forest-slide-trails-bg.webp",
    heading: (
      <>
        Guided rainforest trails
        <br />
        uncovering rare endemic
        <br />
        wildlife species.
      </>
    ),
  },
] as const;

const LAST_SLIDE_INDEX = SLIDES.length - 1;
const MOBILE_SLIDE_DURATION = 0.9;

function clipPathFromProgress(t: number) {
  const x = Math.max(0, Math.min(100, t * 100));
  return `polygon(0 0, ${x}% 0, ${x}% 100%, 0 100%)`;
}

function slideClipT(globalProgress: number, index: number) {
  const step = 1 / (SLIDES.length - 1);

  if (index === 0) {
    if (globalProgress >= step) return 0;
    return 1 - globalProgress / step;
  }

  if (index === SLIDES.length - 1) {
    if (globalProgress < step * (index - 1)) return 0;
    return 1;
  }

  if (globalProgress < step) return 1;
  if (globalProgress >= step * (index + 1)) return 0;
  return 1 - (globalProgress - step) / step;
}

function slideClipPath(globalProgress: number, index: number) {
  const t = slideClipT(globalProgress, index);
  if (t <= 0) return "polygon(0 0, 0 0, 0 100%, 0 100%)";
  if (t >= 1) return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
  return clipPathFromProgress(t);
}

const MOBILE_MQ = "(max-width: 767px)";

function progressFromIndex(index: number) {
  if (LAST_SLIDE_INDEX <= 0) return 0;
  return index / LAST_SLIDE_INDEX;
}

function slideZIndex(index: number) {
  return SLIDES.length - 1 - index;
}

function slideScaleT(globalProgress: number, index: number) {
  if (index === 0) return 1;

  const step = 1 / (SLIDES.length - 1);
  const revealStart = step * (index - 1);

  if (globalProgress <= revealStart) return 0;
  if (globalProgress >= revealStart + step) return 1;
  return (globalProgress - revealStart) / step;
}

function easePower2In(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x;
}

function scaleFromRevealT(t: number) {
  return 1.2 - easePower2In(t) * 0.2;
}

const HEADING_ENTER_Y = 200;
const HEADING_EXIT_Y = -200;
const HEADING_BLUR = 20;
const HEADING_DIM_OPACITY = 0.2;
/** Next heading enter begins once its bg slide is this far through reveal. */
const HEADING_ENTER_BG_REVEAL = 0.55;
/** Fraction of an enter/exit phase reserved for char stagger spread. */
const HEADING_STAGGER_SPAN = 0.28;
const SLIDE_SCROLL_VH = 280;

function getSlideScrollDistance() {
  return (
    (SLIDES.length - 1) * (SLIDE_SCROLL_VH / 100) * window.innerHeight
  );
}

type HeadingPhase = {
  mode: "pre" | "enter" | "hold" | "exit" | "post";
  t: number;
};

/**
 * Maps pinned slide progress → enter / hold / exit for each heading.
 * Enter starts once the matching bg slide is mostly revealed; exit aligns with
 * the next heading's enter window.
 */
function headingPhase(progress: number, index: number): HeadingPhase {
  const step = 1 / (SLIDES.length - 1);
  const last = SLIDES.length - 1;

  if (index === 0) {
    const exitStart = step * HEADING_ENTER_BG_REVEAL;
    const exitEnd = step;
    if (progress <= 0) return { mode: "hold", t: 1 };
    if (progress < exitStart) return { mode: "hold", t: 1 };
    if (progress >= exitEnd) return { mode: "post", t: 1 };
    return {
      mode: "exit",
      t: (progress - exitStart) / (exitEnd - exitStart),
    };
  }

  const enterStart = step * (index - 1 + HEADING_ENTER_BG_REVEAL);
  const enterEnd = step * index;

  if (progress < enterStart) return { mode: "pre", t: 0 };
  if (progress < enterEnd) {
    return {
      mode: "enter",
      t: (progress - enterStart) / (enterEnd - enterStart),
    };
  }

  if (index === last) return { mode: "hold", t: 1 };

  const exitStart = step * (index + HEADING_ENTER_BG_REVEAL);
  const exitEnd = step * (index + 1);

  if (progress < exitStart) return { mode: "hold", t: 1 };
  if (progress < exitEnd) {
    return {
      mode: "exit",
      t: (progress - exitStart) / (exitEnd - exitStart),
    };
  }
  return { mode: "post", t: 1 };
}

function staggeredPhaseT(
  phaseT: number,
  charIndex: number,
  charCount: number,
): number {
  const n = Math.max(1, charCount);
  const charStart = (charIndex / n) * HEADING_STAGGER_SPAN;
  const charDuration = 1 - HEADING_STAGGER_SPAN;
  if (charDuration <= 0) return phaseT >= 1 ? 1 : 0;
  return Math.max(0, Math.min(1, (phaseT - charStart) / charDuration));
}

function headingCharState(
  phase: HeadingPhase,
  charIndex: number,
  charCount: number,
  useBlur: boolean,
) {
  const filter = (px: number) =>
    useBlur ? { filter: `blur(${px}px)` } : { filter: "none" };

  switch (phase.mode) {
    case "pre":
      return {
        y: HEADING_ENTER_Y,
        ...filter(HEADING_BLUR),
        opacity: HEADING_DIM_OPACITY,
      };
    case "post":
      return {
        y: HEADING_EXIT_Y,
        ...filter(HEADING_BLUR),
        opacity: HEADING_DIM_OPACITY,
      };
    case "hold":
      return { y: 0, ...filter(0), opacity: 1 };
    case "enter": {
      const t = staggeredPhaseT(phase.t, charIndex, charCount);
      return {
        y: HEADING_ENTER_Y * (1 - t),
        ...filter(HEADING_BLUR * (1 - t)),
        opacity: HEADING_DIM_OPACITY + (1 - HEADING_DIM_OPACITY) * t,
      };
    }
    case "exit": {
      const t = staggeredPhaseT(phase.t, charIndex, charCount);
      return {
        y: HEADING_EXIT_Y * t,
        ...filter(HEADING_BLUR * t),
        opacity: 1 - (1 - HEADING_DIM_OPACITY) * t,
      };
    }
  }
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M11 18L5 12L11 6M5 12L19 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M13 18L19 12L13 6M19 12L5 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MOBILE_ARROW_BTN =
  "pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center bg-cream/16 text-cream ring-1 ring-inset ring-cream/32 backdrop-blur-[10px] transition-opacity disabled:pointer-events-none disabled:opacity-30";

type ForestSectionProps = {
  overlayTargetRef?: RefObject<HTMLElement | null>;
};

export function ForestSection({
  overlayTargetRef,
}: ForestSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideBgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentOverlayRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const headingSplits = useRef<(SplitText | null)[]>([]);
  const slide0Revealed = useRef(false);
  const slideProgressRef = useRef(0);
  const introProgressRef = useRef(0);
  const slideIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const goToSlideRef = useRef<(index: number) => void>(() => {});
  const armed = useNearViewport(sectionRef);

  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideNavReady, setSlideNavReady] = useState(false);

  useLayoutEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobileLayout(mobileQuery.matches);
    sync();
    mobileQuery.addEventListener("change", sync);
    return () => mobileQuery.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = isMobileLayout;

    const applyStaticSlides = (index: number) => {
      const progress = progressFromIndex(index);
      slideProgressRef.current = progress;
      progressFillRef.current?.style.setProperty(
        "width",
        `${progress * 100}%`,
      );
      slideRefs.current.forEach((slide, slideIndex) => {
        if (!slide) return;
        slide.style.opacity = "1";
        slide.style.clipPath = slideClipPath(progress, slideIndex);
      });
    };

    if (reducedMotion) {
      slideIndexRef.current = 0;
      setActiveSlide(0);
      applyStaticSlides(0);
      if (ctaWrapRef.current) ctaWrapRef.current.style.opacity = "1";

      if (isMobile) {
        goToSlideRef.current = (index: number) => {
          if (index < 0 || index > LAST_SLIDE_INDEX) return;
          if (index === slideIndexRef.current) return;
          slideIndexRef.current = index;
          setActiveSlide(index);
          applyStaticSlides(index);
        };
        setSlideNavReady(true);
      } else {
        goToSlideRef.current = () => {};
        setSlideNavReady(false);
      }

      return () => {
        goToSlideRef.current = () => {};
        setSlideNavReady(false);
      };
    }

    // Defer the SplitText + pin graph until the section is near the viewport.
    if (!armed) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const progressProxy = { progress: 0 };
    let slideTween: gsap.core.Tween | null = null;

    const revertContentAnimations = () => {
      headingSplits.current.forEach((split) => split?.revert());
      headingSplits.current = [];
    };

    const applyHeadingChars = (index: number, phase: HeadingPhase) => {
      const split = headingSplits.current[index];
      const chars = split?.chars;
      if (!chars?.length) return;

      if (split?.masks) {
        gsap.set(split.masks, { height: "1.15em", overflow: "clip" });
      }

      const useBlur = !isMobile;
      const count = chars.length;
      chars.forEach((char, charIndex) => {
        gsap.set(char, headingCharState(phase, charIndex, count, useBlur));
      });
    };

    const updateHeadingChars = (progress: number) => {
      SLIDES.forEach((_, index) => {
        if (index === 0 && !slide0Revealed.current && progress <= 0) {
          // Intro scrub owns slide 0 enter until the section is pinned.
          applyHeadingChars(0, {
            mode: "enter",
            t: introProgressRef.current,
          });
          return;
        }
        applyHeadingChars(index, headingPhase(progress, index));
      });
    };

    const revealSlide0Content = () => {
      if (slide0Revealed.current) return;
      slide0Revealed.current = true;
      gsap.set(ctaWrapRef.current, { opacity: 1 });
      updateHeadingChars(slideProgressRef.current);
    };

    const updateSlides = (progress: number) => {
      slideProgressRef.current = progress;
      progressFillRef.current?.style.setProperty("width", `${progress * 100}%`);

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        slide.style.opacity = "1";
        slide.style.clipPath = slideClipPath(progress, index);
      });

      slideImageRefs.current.forEach((imageWrap, index) => {
        if (!imageWrap) return;
        if (isMobile) {
          gsap.set(imageWrap, { transformOrigin: "center center", scale: 1 });
          return;
        }
        if (index === 0) return;
        gsap.set(imageWrap, {
          transformOrigin: "center center",
          scale: scaleFromRevealT(slideScaleT(progress, index)),
        });
      });

      updateHeadingChars(progress);
    };

    const goToSlide = (index: number) => {
      if (!isMobile) return;
      if (index < 0 || index > LAST_SLIDE_INDEX) return;
      if (isTransitioningRef.current) return;
      if (index === slideIndexRef.current) return;

      const target = progressFromIndex(index);
      isTransitioningRef.current = true;
      slideTween?.kill();
      slideTween = gsap.to(progressProxy, {
        progress: target,
        duration: MOBILE_SLIDE_DURATION,
        ease: "power2.inOut",
        onUpdate: () => updateSlides(progressProxy.progress),
        onComplete: () => {
          isTransitioningRef.current = false;
          slideIndexRef.current = index;
          setActiveSlide(index);
        },
      });
    };

    goToSlideRef.current = goToSlide;

    const ctx = gsap.context(() => {
      slideImageRefs.current.forEach((imageWrap, index) => {
        if (!imageWrap) return;

        gsap.set(imageWrap, {
          transformOrigin: "center center",
          scale: isMobile ? 1 : 1.2,
        });

        // Desktop intro scrub only — mobile reveals content immediately.
        if (index === 0 && !isMobile) {
          const introScrollTrigger: ScrollTrigger.Vars = {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top top",
            scrub: 1,
            invalidateOnRefresh: true,
            refreshPriority: ST_PRIORITY.forest,
            onUpdate(self: ScrollTrigger) {
              introProgressRef.current = self.progress;
              if (!slide0Revealed.current || slideProgressRef.current <= 0) {
                applyHeadingChars(0, {
                  mode: "enter",
                  t: self.progress,
                });
                gsap.set(ctaWrapRef.current, {
                  opacity: self.progress,
                });
              }
            },
            onLeave: () => revealSlide0Content(),
            onRefresh(self: ScrollTrigger) {
              introProgressRef.current = self.progress;
              if (self.progress >= 1) revealSlide0Content();
            },
          };

          gsap.to(imageWrap, {
            scale: 1,
            ease: "power2.in",
            scrollTrigger: introScrollTrigger,
          });
        }
      });

      if (!isMobile) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${getSlideScrollDistance() + window.innerHeight}`,
          pin: pinRef.current,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: ST_PRIORITY.forest,
          onUpdate: (self) => {
            const slideDistance = getSlideScrollDistance();
            const overlay = window.innerHeight;
            const total = slideDistance + overlay;
            const slidePortion = total > 0 ? slideDistance / total : 1;
            const slideProgress = Math.min(1, self.progress / slidePortion);
            updateSlides(slideProgress);
          },
        });

        // Desktop-only approach parallax — same tick as ScrollTrigger.
        const easeReveal = (t: number) => 1 - Math.pow(1 - t, 2.5);
        const parallaxTrigger = {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: ST_PRIORITY.forest,
        };
        const bgs = slideBgRefs.current.filter(Boolean) as HTMLDivElement[];
        if (bgs.length > 0) {
          gsap.fromTo(
            bgs,
            { y: -360 },
            { y: 0, ease: easeReveal, scrollTrigger: parallaxTrigger },
          );
        }
        if (contentOverlayRef.current) {
          gsap.fromTo(
            contentOverlayRef.current,
            { y: -48 },
            { y: 0, ease: easeReveal, scrollTrigger: { ...parallaxTrigger } },
          );
        }
      } else {
        gsap.set(slideBgRefs.current.filter(Boolean), { y: 0 });
        gsap.set(contentOverlayRef.current, { y: 0 });
      }

      updateSlides(0);
    }, sectionRef);

    revertContentAnimations();
    slide0Revealed.current = false;
    introProgressRef.current = 0;
    slideIndexRef.current = 0;
    isTransitioningRef.current = false;
    progressProxy.progress = 0;
    setActiveSlide(0);

    SLIDES.forEach((_, index) => {
      const element = headingRefs.current[index];
      if (!element) return;

      const split = SplitText.create(element, {
        type: "lines,chars",
        mask: "lines",
        autoSplit: true,
        linesClass: "h2-line",
        charsClass: "inline-block",
        onSplit(self) {
          gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
          headingSplits.current[index] = self;
          if (index === 0 && !slide0Revealed.current) {
            applyHeadingChars(0, {
              mode: "enter",
              t: introProgressRef.current,
            });
          } else {
            applyHeadingChars(
              index,
              headingPhase(slideProgressRef.current, index),
            );
          }
        },
      });

      headingSplits.current[index] = split ?? null;
    });

    if (isMobile) {
      // Mobile: no pin scrub — show slide 0 immediately; arrows drive transitions.
      gsap.set(ctaWrapRef.current, { opacity: 1 });
      revealSlide0Content();
      updateSlides(0);
      setSlideNavReady(true);
    } else {
      // CTA fades in once on intro, then stays visible through every slide.
      gsap.set(ctaWrapRef.current, { opacity: 0 });
      updateHeadingChars(0);
      setSlideNavReady(false);
    }

    refreshScrollTriggers();

    return () => {
      slideTween?.kill();
      goToSlideRef.current = () => {};
      setSlideNavReady(false);
      revertContentAnimations();
      slide0Revealed.current = false;
      isTransitioningRef.current = false;
      ctx.revert();
    };
  }, [armed, isMobileLayout]);

  // Overlay observer only — does not rebuild SplitText / pin graph.
  useLayoutEffect(() => {
    const overlayEl = overlayTargetRef?.current;
    if (!overlayEl) return;

    const resizeObserver = new ResizeObserver(() => {
      refreshScrollTriggers(150);
    });
    resizeObserver.observe(overlayEl);

    return () => resizeObserver.disconnect();
  }, [overlayTargetRef]);

  const canGoPrev = activeSlide > 0;
  const canGoNext = activeSlide < LAST_SLIDE_INDEX;

  return (
    <section ref={sectionRef} aria-label="Forest" className="relative z-[1]">
      <div ref={pinRef} className="relative z-[1] h-screen overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.bg}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className="absolute inset-0"
            style={{
              zIndex: slideZIndex(index),
              clipPath:
                index === 0
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(0 0, 0 0, 0 100%, 0 100%)",
            }}
          >
            <div
              ref={(node) => {
                slideBgRefs.current[index] = node;
              }}
              className="absolute inset-0"
            >
              <div
                ref={(node) => {
                  slideImageRefs.current[index] = node;
                }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.bg}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div aria-hidden className="absolute inset-0 bg-black/29" />
            </div>
          </div>
        ))}

        <div
          ref={contentOverlayRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-end px-5 pb-16 md:px-8 md:pb-20"
        >
          <div className="w-full max-w-7xl text-left">
            <div className="relative mb-4 md:mb-6">
              {SLIDES.map((slide, index) => (
                <H2
                  key={`heading-${slide.bg}`}
                  ref={(node) => {
                    headingRefs.current[index] = node;
                  }}
                  animate={false}
                  className={[
                    "max-w-6xl uppercase text-cream",
                    index === 0 ? "relative" : "absolute inset-x-0 top-0",
                  ].join(" ")}
                >
                  {slide.heading}
                </H2>
              ))}
            </div>
            <div
              ref={ctaWrapRef}
              className="pointer-events-auto"
              style={{ opacity: 0 }}
            >
              <GlassyButton href={FOREST_CTA.href}>
                {FOREST_CTA.label}
              </GlassyButton>
            </div>
          </div>
        </div>

        {isMobileLayout && slideNavReady ? (
          <div className="pointer-events-none absolute inset-y-0 inset-x-0 z-40 flex items-center justify-between px-5 md:hidden">
            <button
              type="button"
              aria-label="Previous slide"
              disabled={!canGoPrev}
              onClick={() => goToSlideRef.current(activeSlide - 1)}
              className={MOBILE_ARROW_BTN}
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              disabled={!canGoNext}
              onClick={() => goToSlideRef.current(activeSlide + 1)}
              className={MOBILE_ARROW_BTN}
            >
              <ArrowRightIcon />
            </button>
          </div>
        ) : null}

        <div
          className="absolute inset-x-0 bottom-8 z-30 px-5 md:px-8"
          aria-hidden
        >
          <div className="relative h-px w-full bg-white/20">
            <div
              ref={progressFillRef}
              className="absolute inset-y-0 left-0 h-[2px] -translate-y-px bg-white"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
