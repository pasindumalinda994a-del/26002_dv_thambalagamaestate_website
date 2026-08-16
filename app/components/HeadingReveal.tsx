"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  type ComponentProps,
  type RefObject,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { ST_PRIORITY } from "@/lib/scroll-refresh";
import { usePreloaderComplete } from "./SitePreloader";

gsap.registerPlugin(SplitText, ScrollTrigger);

const MOBILE_MQ = "(max-width: 767px)";

type HeadingTag = "h1" | "h2";

export type HeadingRevealProps = ComponentProps<"h1"> & {
  as?: HeadingTag;
  animate?: boolean;
  revealDelay?: number;
  stagger?: number;
  duration?: number;
  scroll?: boolean;
  ready?: boolean;
  triggerRef?: RefObject<Element | null>;
  triggerStart?: string;
  linesClass?: string;
};

export const HeadingReveal = forwardRef<HTMLHeadingElement, HeadingRevealProps>(
  (
    {
      as: Tag = "h1",
      className,
      children,
      animate = true,
      revealDelay = 0.08,
      stagger = 0.04,
      duration = 0.55,
      scroll = false,
      ready = true,
      triggerRef,
      triggerStart = "top 82%",
      linesClass,
      ...props
    },
    ref,
  ) => {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const wordReveal = Tag === "h2";
    const splitLinesClass = linesClass ?? (Tag === "h2" ? "h2-line" : "h1-line");
    const preloaderComplete = usePreloaderComplete();

    useEffect(() => {
      if (!headingRef.current || !animate || !ready || !preloaderComplete) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const useBlur = !window.matchMedia(MOBILE_MQ).matches;
      let cancelled = false;
      let ctx: gsap.Context | undefined;
      let split: SplitText | undefined;
      const trigger = triggerRef?.current ?? headingRef.current;
      const scrollTriggerVars = scroll
        ? {
            trigger,
            start: triggerStart,
            toggleActions: "play none none reset",
            invalidateOnRefresh: true,
            refreshPriority: ST_PRIORITY.h2,
          }
        : undefined;

      const setup = () => {
        if (cancelled || !headingRef.current) return;

        ctx = gsap.context(() => {
          if (wordReveal) {
            split = SplitText.create(headingRef.current!, {
              type: "words",
              autoSplit: true,
              tag: "span",
              wordsClass: "inline-block",
              onSplit(self) {
                if (!self.words.length) return;

                gsap.set(self.words, {
                  opacity: 0,
                  filter: "blur(10px)",
                });

                return gsap.to(self.words, {
                  opacity: 1,
                  filter: "blur(0px)",
                  duration,
                  ease: "sine.out",
                  stagger,
                  delay: revealDelay,
                  ...(scrollTriggerVars
                    ? { scrollTrigger: scrollTriggerVars }
                    : {}),
                });
              },
            });
            return;
          }

          split = SplitText.create(headingRef.current!, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            linesClass: splitLinesClass,
            charsClass: "inline-block",
            onSplit(self) {
              if (!self.chars.length) return;

              gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
              gsap.set(self.chars, {
                y: 200,
                opacity: 0,
                ...(useBlur
                  ? { filter: "blur(20px)" }
                  : { filter: "none" }),
              });

              return gsap.to(self.chars, {
                y: 0,
                opacity: 1,
                ...(useBlur ? { filter: "blur(0px)" } : { filter: "none" }),
                duration,
                ease: "power2.out",
                stagger,
                delay: revealDelay,
                ...(scrollTriggerVars
                  ? { scrollTrigger: scrollTriggerVars }
                  : {}),
              });
            },
          });
        }, headingRef);
      };

      // Wait for fonts so autoSplit doesn't re-split mid-init
      // (that race can leave holes in GSAP's internal _triggers array).
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
        ctx?.revert();
        split?.revert();
      };
    }, [
      animate,
      duration,
      preloaderComplete,
      ready,
      revealDelay,
      scroll,
      splitLinesClass,
      stagger,
      triggerRef,
      triggerStart,
      wordReveal,
    ]);

    return (
      <Tag
        ref={(element) => {
          headingRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        className={className}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

HeadingReveal.displayName = "HeadingReveal";
