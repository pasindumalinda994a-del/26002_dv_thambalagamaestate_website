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
import { refreshScrollTriggers } from "@/lib/scroll-refresh";

gsap.registerPlugin(SplitText, ScrollTrigger);

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

      let split: SplitText | undefined;
      const trigger = triggerRef?.current ?? headingRef.current;

      const ctx = gsap.context(() => {
        split = SplitText.create(headingRef.current!, {
          type: "lines,chars",
          mask: "lines",
          autoSplit: true,
          linesClass: "h2-line",
          charsClass: "inline-block",
          onSplit(self) {
            gsap.set(self.masks, { height: "1.15em", overflow: "clip" });
            gsap.set(self.chars, {
              y: 200,
              filter: "blur(20px)",
              opacity: 0.2,
            });

            return gsap.to(self.chars, {
              y: 0,
              filter: "blur(0px)",
              opacity: 1,
              duration: 0.8,
              ease: "power4.out",
              stagger,
              delay: revealDelay,
              scrollTrigger: {
                trigger,
                start: triggerStart,
                once: true,
                invalidateOnRefresh: true,
              },
            });
          },
        });
      }, headingRef);

      refreshScrollTriggers();

      return () => {
        ctx.revert();
        split?.revert();
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
          "font-space-grotesk text-[clamp(24px,6.15vw,54px)] font-normal leading-[130%] tracking-[0.2px]",
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
