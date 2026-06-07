import type { ComponentProps } from "react";
import { forwardRef } from "react";

export type ParagraphProps = ComponentProps<"p">;

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={[
          "font-secondary text-[clamp(16px,1.25vw+2px,20px)] font-regular leading-[130%] tracking-[0.5px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </p>
    );
  },
);

Paragraph.displayName = "Paragraph";
