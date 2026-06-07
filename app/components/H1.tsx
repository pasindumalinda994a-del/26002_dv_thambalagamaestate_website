import type { ComponentProps } from "react";
import { forwardRef } from "react";

export type H1Props = ComponentProps<"h1">;

export const H1 = forwardRef<HTMLHeadingElement, H1Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={[
          "font-primary text-[clamp(36px,5vw+20px,76px)] font-normal leading-[130%] tracking-[0.2px]",
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
