"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

type ScrollDownHintProps = {
  className?: string;
  label?: string;
};

export function ScrollDownHint({
  className,
  label = "Scroll to explore",
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
        "pointer-events-none flex flex-col items-center gap-3 text-cream",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-secondary text-[14px] font-medium uppercase tracking-[0.14em]">
        {label}
      </span>
      <span ref={iconRef} className="inline-flex shrink-0">
        <Image
          src="/icons/scroll-hint.svg"
          alt=""
          width={38}
          height={38}
          className="shrink-0"
        />
      </span>
    </div>
  );
}
