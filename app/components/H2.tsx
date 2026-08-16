"use client";

import {
  type ComponentProps,
  type RefObject,
  forwardRef,
} from "react";
import { HeadingReveal } from "./HeadingReveal";

export type H2Props = ComponentProps<"h2"> & {
  animate?: boolean;
  revealDelay?: number;
  stagger?: number;
  ready?: boolean;
  triggerRef?: RefObject<Element | null>;
  triggerStart?: string;
};

export const H2 = forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <HeadingReveal
        ref={ref}
        as="h2"
        duration={1.25}
        stagger={0.2}
        scroll
        className={[
          "font-space-grotesk text-[clamp(24px,6.15vw,54px)] font-bold leading-[130%] tracking-[0.2px]",
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

H2.displayName = "H2";
