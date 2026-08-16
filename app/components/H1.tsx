"use client";

import { type ComponentProps, forwardRef } from "react";
import { HeadingReveal } from "./HeadingReveal";

export type H1Props = ComponentProps<"h1"> & {
  animate?: boolean;
  revealDelay?: number;
  stagger?: number;
};

export const H1 = forwardRef<HTMLHeadingElement, H1Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <HeadingReveal
        ref={ref}
        as="h1"
        duration={1.4}
        stagger={0.07}
        className={[
          "font-space-grotesk text-[clamp(36px,9.23vw,76px)] font-medium leading-[130%] tracking-[0.2px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </HeadingReveal>
    );
  },
);

H1.displayName = "H1";
