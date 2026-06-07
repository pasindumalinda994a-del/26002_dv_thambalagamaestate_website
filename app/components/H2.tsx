import type { ComponentProps } from "react";
import { forwardRef } from "react";

export type H2Props = ComponentProps<"h2">;

export const H2 = forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
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
      </h2>
    );
  },
);

H2.displayName = "H2";
