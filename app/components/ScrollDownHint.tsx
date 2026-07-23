"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

type ScrollDownHintProps = {
  className?: string;
  label?: string;
};

export function ScrollDownHint({
  className,
  label = "Scroll to experience",
}: ScrollDownHintProps) {
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(iconRef.current, {
        y: 6,
        duration: 1.35,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, iconRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none flex flex-col items-center gap-3 text-cream/65",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-secondary text-[10px] font-medium uppercase tracking-[0.28em] md:text-[11px]">
        {label}
      </span>
      <span ref={iconRef} className="flex flex-col items-center gap-1.5">
        <span className="h-7 w-px bg-cream/45 md:h-8" />
        <svg
          width={12}
          height={8}
          viewBox="0 0 12 8"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
