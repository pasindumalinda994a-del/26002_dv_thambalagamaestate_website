"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";

const SLIDES = [
  {
    bg: "/main%20images/Forest%20Section%20Bg%201.webp",
    heading: (
      <>
        Sharing a border with
        <br />a world heritage site.
      </>
    ),
    body:
      "Thambalagama Estate sits directly on the boundary of the UNESCO Sinharaja Rainforest buffer zone. Located just 7 km (a brief 15-minute drive) from the iconic Lankagama gate, this is not a stay near the forest—it is a stay within its rhythm.",
  },
  {
    bg: "/main%20images/Forest%20Section%20Bg%202.webp",
    heading: (
      <>
        Two private waterfalls.
        <br />
        One natural pool.
      </>
    ),
    body:
      "Because the forest border runs alongside our grounds, nature bleeds directly into the estate. Guests enjoy completely exclusive access to two private waterfalls and a pristine, natural swimming pool fed entirely by the jungle, located steps from the bungalow.",
  },
  {
    bg: "/main%20images/Forest%20Section%20Bg%203.webp",
    heading: "An endemic sanctuary.",
    body:
      "A paradise for bird watchers, wildlife photographers, and thinkers. Step directly from the balcony into guided trails uncovering over 9 hidden waterfalls and rare endemic species.",
    cta: { label: "Explore the forest", href: "/experiences" },
  },
] as const;

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

function easeOutSmooth(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 2.5);
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
const BODY_ENTER_DURATION = 1.1;
const BODY_EXIT_DURATION = 0.8;
const BODY_ENTER_STAGGER = 0.18;

function getSlideScrollDistance() {
  return (
    (SLIDES.length - 1) * (SLIDE_SCROLL_VH / 100) * window.innerHeight
  );
}

function shouldRevealContent(progress: number, index: number) {
  if (index === 0) return false;
  return slideClipT(progress, index - 1) <= 1 - HEADING_ENTER_BG_REVEAL;
}

function targetContentIndex(progress: number) {
  for (let i = SLIDES.length - 1; i >= 1; i--) {
    if (shouldRevealContent(progress, i)) return i;
  }
  return 0;
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
) {
  switch (phase.mode) {
    case "pre":
      return {
        y: HEADING_ENTER_Y,
        filter: `blur(${HEADING_BLUR}px)`,
        opacity: HEADING_DIM_OPACITY,
      };
    case "post":
      return {
        y: HEADING_EXIT_Y,
        filter: `blur(${HEADING_BLUR}px)`,
        opacity: HEADING_DIM_OPACITY,
      };
    case "hold":
      return { y: 0, filter: "blur(0px)", opacity: 1 };
    case "enter": {
      const t = staggeredPhaseT(phase.t, charIndex, charCount);
      return {
        y: HEADING_ENTER_Y * (1 - t),
        filter: `blur(${HEADING_BLUR * (1 - t)}px)`,
        opacity: HEADING_DIM_OPACITY + (1 - HEADING_DIM_OPACITY) * t,
      };
    }
    case "exit": {
      const t = staggeredPhaseT(phase.t, charIndex, charCount);
      return {
        y: HEADING_EXIT_Y * t,
        filter: `blur(${HEADING_BLUR * t}px)`,
        opacity: 1 - (1 - HEADING_DIM_OPACITY) * t,
      };
    }
  }
}

function collectSecondaryTargets(
  bodyRefs: (HTMLParagraphElement | null)[],
  ctaWrapRefs: (HTMLDivElement | null)[],
  index: number,
) {
  const targets: HTMLElement[] = [];
  const body = bodyRefs[index];
  const cta = ctaWrapRefs[index];
  if (body) targets.push(body);
  if (cta) targets.push(cta);
  return targets;
}

type ForestSectionProps = {
  overlayTargetRef?: RefObject<HTMLElement | null>;
  overlayReady?: boolean;
};

export function ForestSection({
  overlayTargetRef,
  overlayReady = true,
}: ForestSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideBgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentOverlayRef = useRef<HTMLDivElement>(null);
  const contentGroupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const ctaWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingSplits = useRef<(SplitText | null)[]>([]);
  const contentTweens = useRef<(gsap.core.Animation | null)[]>([]);
  const revealedSlides = useRef(new Set<number>());
  const slide0Revealed = useRef(false);
  const transitioning = useRef(false);
  const lastTargetContent = useRef(0);
  const activeContentIndex = useRef(0);
  const slideProgressRef = useRef(0);
  const introProgressRef = useRef(0);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        slide.style.clipPath =
          index === 0
            ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(0 0, 0 0, 0 100%, 0 100%)";
      });
      progressFillRef.current?.style.setProperty("width", "0%");
      contentGroupRefs.current.forEach((group, index) => {
        if (!group) return;
        group.style.opacity = index === 0 ? "1" : "0";
        group.style.pointerEvents = index === 0 ? "auto" : "none";
      });
      bodyRefs.current.forEach((body, index) => {
        if (!body) return;
        body.style.opacity = index === 0 ? "1" : "0";
      });
      ctaWrapRefs.current.forEach((cta, index) => {
        if (!cta) return;
        cta.style.opacity = index === 0 ? "1" : "0";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const getSecondary = (index: number) =>
      collectSecondaryTargets(bodyRefs.current, ctaWrapRefs.current, index);

    const revertContentAnimations = () => {
      headingSplits.current.forEach((split) => split?.revert());
      headingSplits.current = [];
      contentTweens.current.forEach((tween) => tween?.kill());
      contentTweens.current = [];
    };

    const applyHeadingChars = (index: number, phase: HeadingPhase) => {
      const split = headingSplits.current[index];
      const chars = split?.chars;
      if (!chars?.length) return;

      if (split?.masks) {
        gsap.set(split.masks, { height: "1.15em", overflow: "clip" });
      }

      const count = chars.length;
      chars.forEach((char, charIndex) => {
        gsap.set(char, headingCharState(phase, charIndex, count));
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

      const target = targetContentIndex(slideProgressRef.current);
      if (target > 0) {
        transitionToContent(target);
      } else {
        playContentEnter(0);
      }
      updateHeadingChars(slideProgressRef.current);
    };

    const playContentEnter = (index: number) => {
      const group = contentGroupRefs.current[index];
      if (!group || revealedSlides.current.has(index)) return;

      contentTweens.current[index]?.kill();

      const secondary = getSecondary(index);
      gsap.set(group, { opacity: 1, pointerEvents: "auto" });

      revealedSlides.current.add(index);
      activeContentIndex.current = index;
      lastTargetContent.current = index;

      const tween = gsap.timeline();
      if (secondary.length > 0) {
        const introComplete = index === 0 && introProgressRef.current >= 1;
        gsap.set(secondary, { opacity: introComplete ? 1 : 0 });
        tween.fromTo(
          secondary,
          { opacity: introComplete ? 1 : 0 },
          {
            opacity: 1,
            duration: BODY_ENTER_DURATION,
            stagger: BODY_ENTER_STAGGER,
            ease: "power2.out",
          },
          0,
        );
      }

      contentTweens.current[index] = tween;
    };

    const playContentExit = (index: number, onComplete?: () => void) => {
      const group = contentGroupRefs.current[index];
      if (!group || !revealedSlides.current.has(index)) {
        onComplete?.();
        return;
      }

      contentTweens.current[index]?.kill();

      const secondary = getSecondary(index);
      if (secondary.length === 0) {
        gsap.set(group, { pointerEvents: "none" });
        revealedSlides.current.delete(index);
        onComplete?.();
        return;
      }

      contentTweens.current[index] = gsap.to(secondary, {
        opacity: 0,
        duration: BODY_EXIT_DURATION,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(group, { pointerEvents: "none" });
          revealedSlides.current.delete(index);
          onComplete?.();
        },
      });
    };

    const transitionToContent = (target: number) => {
      if (transitioning.current) return;

      const current = activeContentIndex.current;
      if (current === target) return;

      transitioning.current = true;

      const finish = () => {
        playContentEnter(target);
        transitioning.current = false;
      };

      if (revealedSlides.current.has(current)) {
        playContentExit(current, finish);
      } else {
        finish();
      }
    };

    const updateSlides = (progress: number) => {
      slideProgressRef.current = progress;
      progressFillRef.current?.style.setProperty("width", `${progress * 100}%`);

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        slide.style.clipPath = slideClipPath(progress, index);
      });

      slideImageRefs.current.forEach((imageWrap, index) => {
        if (!imageWrap || index === 0) return;
        gsap.set(imageWrap, {
          transformOrigin: "center center",
          scale: scaleFromRevealT(slideScaleT(progress, index)),
        });
      });

      updateHeadingChars(progress);

      const target = targetContentIndex(progress);
      if (target !== lastTargetContent.current && !transitioning.current) {
        if (target > 0 && !slide0Revealed.current) return;
        transitionToContent(target);
      }
    };

    const ctx = gsap.context(() => {
      slideImageRefs.current.forEach((imageWrap, index) => {
        if (!imageWrap) return;

        gsap.set(imageWrap, { transformOrigin: "center center", scale: 1.2 });

        if (index === 0) {
          gsap.to(imageWrap, {
            scale: 1,
            ease: "power2.in",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top top",
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate(self) {
                introProgressRef.current = self.progress;
                if (!slide0Revealed.current || slideProgressRef.current <= 0) {
                  applyHeadingChars(0, {
                    mode: "enter",
                    t: self.progress,
                  });
                      gsap.set(getSecondary(0), {
                        opacity: self.progress,
                      });
                }
              },
              onLeave: () => revealSlide0Content(),
              onRefresh(self) {
                introProgressRef.current = self.progress;
                if (self.progress >= 1) revealSlide0Content();
              },
            },
          });
        }
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getSlideScrollDistance() + window.innerHeight}`,
        pin: pinRef.current,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const slideDistance = getSlideScrollDistance();
          const overlay = window.innerHeight;
          const total = slideDistance + overlay;
          const slidePortion = total > 0 ? slideDistance / total : 1;
          const slideProgress = Math.min(1, self.progress / slidePortion);
          updateSlides(slideProgress);
        },
      });

      updateSlides(0);
    }, sectionRef);

    revertContentAnimations();
    revealedSlides.current.clear();
    slide0Revealed.current = false;
    transitioning.current = false;
    lastTargetContent.current = 0;
    activeContentIndex.current = 0;
    introProgressRef.current = 0;

    SLIDES.forEach((_, index) => {
      const element = headingRefs.current[index];
      const group = contentGroupRefs.current[index];
      if (!element || !group) return;

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

      const secondary = getSecondary(index);
      // Groups stay visible so scrubbed headings aren't faded; body/CTA use opacity.
      gsap.set(group, { opacity: 1, pointerEvents: "none" });
      gsap.set(secondary, { opacity: 0 });
    });

    updateHeadingChars(0);

    const overlayEl = overlayTargetRef?.current;
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    if (overlayEl) resizeObserver.observe(overlayEl);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      resizeObserver.disconnect();
      revertContentAnimations();
      revealedSlides.current.clear();
      slide0Revealed.current = false;
      transitioning.current = false;
      ctx.revert();
    };
  }, [overlayTargetRef, overlayReady]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

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
      const progressAtFullReveal =
        viewportHeight / (viewportHeight + revealHeight);
      const revealT = revealComplete
        ? 1
        : Math.max(0, Math.min(1, rawProgress / progressAtFullReveal));
      const progress = easeOutSmooth(revealT) * progressAtFullReveal;

      const centeredProgress = (progress - 0.5) * 2;
      const travelBase = centeredProgress * 240;
      const bgY = travelBase * 1.5;
      const fgY = travelBase * 0.2;

      slideBgRefs.current.forEach((bg) => {
        if (!bg) return;
        bg.style.transform = `translate3d(0, ${bgY}px, 0)`;
      });

      const overlay = contentOverlayRef.current;
      if (overlay) {
        overlay.style.transform = `translate3d(0, ${fgY}px, 0)`;
      }

      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    updateParallax();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

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
          className="pointer-events-none absolute inset-0 z-20 px-5 md:px-8"
        >
          {SLIDES.map((slide, index) => (
            <div
              key={`content-${slide.bg}`}
              ref={(node) => {
                contentGroupRefs.current[index] = node;
              }}
              className="absolute top-1/2 right-0 left-0 max-w-7xl -translate-y-1/2 text-left"
              style={{
                opacity: 1,
                pointerEvents: "none",
              }}
            >
              <H2
                ref={(node) => {
                  headingRefs.current[index] = node;
                }}
                animate={false}
                className="mb-4 max-w-6xl uppercase text-cream md:mb-6"
              >
                {slide.heading}
              </H2>
              <Paragraph
                ref={(node) => {
                  bodyRefs.current[index] = node;
                }}
                className="mb-4 max-w-4xl text-cream/90 md:mb-6"
              >
                {slide.body}
              </Paragraph>
              {"cta" in slide && slide.cta ? (
                <div
                  ref={(node) => {
                    ctaWrapRefs.current[index] = node;
                  }}
                >
                  <GlassyButton href={slide.cta.href}>{slide.cta.label}</GlassyButton>
                </div>
              ) : null}
            </div>
          ))}
        </div>

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
