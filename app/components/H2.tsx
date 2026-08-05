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

gsap.registerPlugin(SplitText, ScrollTrigger);

const MOBILE_MQ = "(max-width: 767px)";

export type H2Props = ComponentProps<"h2"> & {
  animate?: boolean;
  revealDelay?: number;
  stagger?: number;
  ready?: boolean;
  triggerRef?: RefObject<Element | null>;
  triggerStart?: string;
};

export const H2 = forwardRef<HTMLHeadingElement, H2Props>(
  (
    {
      className,
      children,
      animate = true,
      revealDelay = 0.2,
      stagger = 0.05,
      ready = true,
      triggerRef,
      triggerStart = "top 82%",
      ...props
    },
    ref,
  ) => {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
      if (!headingRef.current || !animate || !ready) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const useBlur = !window.matchMedia(MOBILE_MQ).matches;
      let cancelled = false;
      let ctx: gsap.Context | undefined;
      const trigger = triggerRef?.current ?? headingRef.current;

      const setup = () => {
        if (cancelled || !headingRef.current) return;

        ctx = gsap.context(() => {
          SplitText.create(headingRef.current!, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            linesClass: "h2-line",
            charsClass: "inline-block",
            onSplit(self) {
              if (!self.chars.length) return;

              gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
              gsap.set(self.chars, {
                y: 200,
                opacity: 0.2,
                ...(useBlur
                  ? { filter: "blur(20px)" }
                  : { filter: "none" }),
              });

              return gsap.to(self.chars, {
                y: 0,
                opacity: 1,
                ...(useBlur ? { filter: "blur(0px)" } : { filter: "none" }),
                duration: 0.8,
                ease: "power4.out",
                stagger,
                delay: revealDelay,
                scrollTrigger: {
                  trigger,
                  start: triggerStart,
                  once: true,
                  invalidateOnRefresh: true,
                  refreshPriority: ST_PRIORITY.h2,
                },
              });
            },
          });
        }, headingRef);
      };

      // Wait for fonts so autoSplit doesn't re-split mid-ScrollTrigger init
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
      };
    }, [animate, ready, revealDelay, stagger, triggerRef, triggerStart]);

    return (
      <h2
        ref={(element) => {
          headingRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        className={[
          "font-space-grotesk text-[clamp(24px,6.15vw,54px)] font-bold leading-[130%] tracking-[0.2px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </h2>
    );
  },
);

H2.displayName = "H2";
