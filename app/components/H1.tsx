"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { type ComponentProps, forwardRef, useEffect, useRef } from "react";

gsap.registerPlugin(SplitText);

const MOBILE_MQ = "(max-width: 767px)";

export type H1Props = ComponentProps<"h1"> & {
  animate?: boolean;
  revealDelay?: number;
  stagger?: number;
};

export const H1 = forwardRef<HTMLHeadingElement, H1Props>(
  (
    {
      className,
      children,
      animate = true,
      revealDelay = 0.2,
      stagger = 0.05,
      ...props
    },
    ref,
  ) => {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
      if (!headingRef.current || !animate) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const useBlur = !window.matchMedia(MOBILE_MQ).matches;
      let split: SplitText | undefined;

      const ctx = gsap.context(() => {
        split = SplitText.create(headingRef.current!, {
          type: "lines,chars",
          mask: "lines",
          autoSplit: true,
          linesClass: "h1-line",
          charsClass: "inline-block",
          onSplit(self) {
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
              duration: 1.8,
              ease: "power4.out",
              stagger,
              delay: revealDelay,
            });
          },
        });
      }, headingRef);

      return () => {
        ctx.revert();
        split?.revert();
      };
    }, [animate, revealDelay, stagger]);

    return (
      <h1
        ref={(element) => {
          headingRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        className={[
          "font-space-grotesk text-[clamp(36px,9.23vw,76px)] font-medium leading-[130%] tracking-[0.2px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </h1>
    );
  },
);

H1.displayName = "H1";
