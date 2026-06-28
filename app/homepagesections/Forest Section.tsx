"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { GlassyButton } from "../components/GlassyButton";
import { H2 } from "../components/H2";
import { Paragraph } from "../components/Paragraph";
import { getStackRevealDistance } from "./stackScroll";

const CLIP_FULL = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
const CLIP_HIDDEN = "polygon(0 0, 0 0, 0 100%, 0 100%)";

const SLIDES = [
  {
    bg: "/main%20images/Forest%20Section%20Bg%201.png",
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
    bg: "/main%20images/Forest%20Section%20Bg%202.png",
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
    bg: "/main%20images/Forest%20Section%20Bg%203.png",
    heading: "An endemic sanctuary.",
    body:
      "A paradise for bird watchers, wildlife photographers, and thinkers. Step directly from the balcony into guided trails uncovering over 9 hidden waterfalls and rare endemic species.",
    cta: { label: "Explore the forest", href: "/experiences" },
  },
] as const;

const SLIDE_COUNT = SLIDES.length;
const FOREST_SCROLL_PER_TRANSITION = 150;
const FOREST_BG_SPEED = 1.5;
const FOREST_FG_SPEED = 0.2;

function clipPathFromProgress(t: number) {
  const x = Math.max(0, Math.min(100, t * 100));
  return `polygon(0 0, ${x}% 0, ${x}% 100%, 0 100%)`;
}

function slideClipT(globalProgress: number, index: number) {
  const step = 1 / (SLIDE_COUNT - 1);

  if (index === 0) {
    if (globalProgress >= step) return 0;
    return 1 - globalProgress / step;
  }

  if (index === SLIDE_COUNT - 1) {
    if (globalProgress < step * (index - 1)) return 0;
    return 1;
  }

  if (globalProgress < step) return 1;
  if (globalProgress >= step * (index + 1)) return 0;
  return 1 - (globalProgress - step) / step;
}

function slideClipPath(globalProgress: number, index: number) {
  const t = slideClipT(globalProgress, index);
  if (t <= 0) return CLIP_HIDDEN;
  if (t >= 1) return CLIP_FULL;
  return clipPathFromProgress(t);
}

function slideZIndex(index: number) {
  return SLIDE_COUNT - 1 - index;
}

function slideScaleT(globalProgress: number, index: number) {
  if (index === 0) return 1;

  const step = 1 / (SLIDE_COUNT - 1);
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

function getSlideScrollDistance() {
  return (
    (SLIDE_COUNT - 1) * (FOREST_SCROLL_PER_TRANSITION / 100) * window.innerHeight
  );
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
  const slideContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const headingTweens = useRef<(gsap.core.Tween | null)[]>([]);
  const headingSplits = useRef<(SplitText | null)[]>([]);
  const revealedSlides = useRef(new Set<number>());

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        slide.style.clipPath = index === 0 ? CLIP_FULL : CLIP_HIDDEN;
      });
      progressFillRef.current?.style.setProperty("width", "0%");
      return;
    }

    if (overlayTargetRef && !overlayReady) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const revertManualHeadingReveals = () => {
      headingTweens.current.forEach((tween) => tween?.kill());
      headingTweens.current = [];
      headingSplits.current.forEach((split) => split?.revert());
      headingSplits.current = [];
    };

    const updateSlides = (progress: number) => {
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

      SLIDES.forEach((_, index) => {
        if (index === 0) return;

        const imageFullyRevealed = slideScaleT(progress, index) >= 1;
        if (imageFullyRevealed && !revealedSlides.current.has(index)) {
          revealedSlides.current.add(index);
          headingTweens.current[index]?.play();
        }
      });
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
            },
          });
        }
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getSlideScrollDistance() + getStackRevealDistance()}`,
        pin: pinRef.current,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const slideDistance = getSlideScrollDistance();
          const overlay = getStackRevealDistance();
          const total = slideDistance + overlay;
          const slidePortion = total > 0 ? slideDistance / total : 1;
          const slideProgress = Math.min(1, self.progress / slidePortion);
          updateSlides(slideProgress);
        },
      });

      updateSlides(0);
    }, sectionRef);

    revertManualHeadingReveals();
    revealedSlides.current.clear();

    [1, 2].forEach((index) => {
      const element = headingRefs.current[index];
      if (!element) return;

      let split: SplitText | undefined;
      let tween: gsap.core.Tween | undefined;

      split = SplitText.create(element, {
        type: "lines,chars",
        mask: "lines",
        autoSplit: true,
        linesClass: "h2-line",
        charsClass: "inline-block",
        onSplit(self) {
          gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
          gsap.set(self.chars, { y: 200 });

          tween = gsap.to(self.chars, {
            y: 0,
            duration: 1.5,
            ease: "power4.out",
            stagger: 0.05,
            delay: 0.2,
            paused: true,
          });
        },
      });

      headingTweens.current[index] = tween ?? null;
      headingSplits.current[index] = split ?? null;
    });

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
      revertManualHeadingReveals();
      revealedSlides.current.clear();
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
      const bgY = travelBase * FOREST_BG_SPEED;
      const fgY = travelBase * FOREST_FG_SPEED;

      slideBgRefs.current.forEach((bg) => {
        if (!bg) return;
        bg.style.transform = `translate3d(0, ${bgY}px, 0)`;
      });

      slideContentRefs.current.forEach((content) => {
        if (!content) return;
        content.style.transform = `translate3d(0, ${fgY}px, 0)`;
      });

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
            className="absolute inset-0 will-change-[clip-path]"
            style={{
              zIndex: slideZIndex(index),
              clipPath: index === 0 ? CLIP_FULL : CLIP_HIDDEN,
            }}
          >
            <div
              ref={(node) => {
                slideBgRefs.current[index] = node;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <div
                ref={(node) => {
                  slideImageRefs.current[index] = node;
                }}
                className="absolute inset-0 will-change-transform"
              >
                <Image
                  src={slide.bg}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
              <div aria-hidden className="absolute inset-0 bg-black/29" />
            </div>

            <div
              ref={(node) => {
                slideContentRefs.current[index] = node;
              }}
              className="absolute inset-0 will-change-transform px-5 md:px-8"
            >
              <div className="absolute top-1/2 max-w-7xl -translate-y-1/2 space-y-6">
                <H2
                  ref={(node) => {
                    headingRefs.current[index] = node;
                  }}
                  animate={index !== 0 ? false : undefined}
                  triggerRef={index === 0 ? sectionRef : undefined}
                  triggerStart={index === 0 ? "top 82%" : undefined}
                  className="max-w-6xl uppercase text-cream"
                >
                  {slide.heading}
                </H2>
                <Paragraph className="max-w-4xl text-cream/90">{slide.body}</Paragraph>
                {"cta" in slide && slide.cta ? (
                  <GlassyButton href={slide.cta.href}>{slide.cta.label}</GlassyButton>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        <div
          className="absolute inset-x-0 bottom-8 z-20 px-5 md:px-8"
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
