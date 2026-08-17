"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

export type ScrollHintDirection = "up" | "down" | "left" | "right";

type ScrollDownHintProps = {
  className?: string;
  label?: string;
  direction?: ScrollHintDirection;
  /** Hide the label and keep the chevrons. */
  compact?: boolean;
  /** Compact on small viewports only; full lockup from md up. */
  compactOnMobile?: boolean;
};

const CHEVRON_PATH: Record<ScrollHintDirection, string> = {
  down: "M4 6.5 L12 14.5 L20 6.5",
  up: "M4 13.5 L12 5.5 L20 13.5",
  left: "M13.5 4 L5.5 12 L13.5 20",
  right: "M6.5 4 L14.5 12 L6.5 20",
};

function Chevron({ direction }: { direction: ScrollHintDirection }) {
  const vertical = direction === "up" || direction === "down";

  return (
    <svg
      data-chevron
      viewBox={vertical ? "0 0 24 20" : "0 0 20 24"}
      width={vertical ? 18 : 14}
      height={vertical ? 14 : 18}
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d={CHEVRON_PATH[direction]}
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function layoutClass(direction: ScrollHintDirection) {
  switch (direction) {
    case "up":
      return "flex-col-reverse";
    case "left":
      return "flex-row-reverse";
    case "right":
      return "flex-row";
    default:
      return "flex-col";
  }
}

function chevronStackClass(direction: ScrollHintDirection) {
  switch (direction) {
    case "left":
      return "flex-row-reverse";
    case "right":
      return "flex-row";
    case "up":
      return "flex-col-reverse";
    default:
      return "flex-col";
  }
}

function shiftFor(direction: ScrollHintDirection) {
  const delta = 3;
  if (direction === "up") return { y: -delta };
  if (direction === "left") return { x: -delta };
  if (direction === "right") return { x: delta };
  return { y: delta };
}

export function ScrollDownHint({
  className,
  label = "Explore further",
  direction = "down",
  compact = false,
  compactOnMobile = false,
}: ScrollDownHintProps) {
  const stackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chevrons = stack.querySelectorAll("[data-chevron]");
    if (chevrons.length === 0) return;

    const shift = shiftFor(direction);
    const ctx = gsap.context(() => {
      gsap.set(chevrons, { opacity: 0.2, x: 0, y: 0 });

      gsap
        .timeline({
          repeat: -1,
          defaults: { ease: "power1.inOut" },
        })
        .to(chevrons, {
          opacity: 1,
          ...shift,
          stagger: 0.12,
          duration: 0.5,
        })
        .to(
          chevrons,
          {
            opacity: 0.2,
            x: 0,
            y: 0,
            stagger: 0.12,
            duration: 0.5,
          },
          "-=0.15",
        );
    }, stack);

    return () => ctx.revert();
  }, [direction]);

  const horizontal = direction === "left" || direction === "right";

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none inline-flex items-center text-cream",
        layoutClass(direction),
        compact
          ? "gap-1"
          : compactOnMobile
            ? "gap-1 md:gap-1.5"
            : "gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "font-space-grotesk text-[11px] font-light uppercase tracking-[0.22em] md:text-[12px]",
          compact
            ? "hidden"
            : compactOnMobile
              ? "hidden md:inline"
              : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
      <span
        ref={stackRef}
        className={[
          "inline-flex items-center",
          chevronStackClass(direction),
          horizontal ? "-space-x-1" : "-space-y-1",
        ].join(" ")}
      >
        <Chevron direction={direction} />
        <Chevron direction={direction} />
        <Chevron direction={direction} />
      </span>
    </div>
  );
}
