"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { ScrollDownHint, type ScrollHintDirection } from "./ScrollDownHint";

const FADE_IN_DURATION = 0.45;
const FADE_OUT_DURATION = 0.35;
const DEFAULT_HIDE_AFTER = 0.22;

type PinnedScrollHintProps = {
  triggerRef: RefObject<Element | null>;
  start?: string | number | ((self: ScrollTrigger) => string | number);
  end: string | number | ((self: ScrollTrigger) => string | number);
  hideAfter?: number;
  refreshPriority?: number;
  enabled?: boolean;
  className?: string;
  label?: string;
  compact?: boolean;
  compactOnMobile?: boolean;
  direction?: ScrollHintDirection;
};

export function PinnedScrollHint({
  triggerRef,
  start = "top top",
  end,
  hideAfter = DEFAULT_HIDE_AFTER,
  refreshPriority,
  enabled = true,
  className,
  label,
  compact,
  compactOnMobile,
  direction,
}: PinnedScrollHintProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const endRef = useRef(end);
  endRef.current = end;

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const root = rootRef.current;
    if (!enabled || !trigger || !root) return;

    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fadeIn = reducedMotion ? 0 : FADE_IN_DURATION;
    const fadeOut = reducedMotion ? 0 : FADE_OUT_DURATION;

    gsap.set(root, { opacity: 0 });

    let fadeTween: gsap.core.Tween | null = null;
    let shown = false;

    const showHint = () => {
      if (shown) return;
      shown = true;
      fadeTween?.kill();
      fadeTween = gsap.to(root, {
        opacity: 1,
        duration: fadeIn,
        ease: "power1.out",
        overwrite: true,
      });
    };

    const hideHint = () => {
      if (!shown) return;
      shown = false;
      fadeTween?.kill();
      fadeTween = gsap.to(root, {
        opacity: 0,
        duration: fadeOut,
        ease: "power1.out",
        overwrite: true,
      });
    };

    const sync = (self: ScrollTrigger) => {
      if (self.isActive && self.progress < hideAfter) showHint();
      else hideHint();
    };

    const st = ScrollTrigger.create({
      trigger,
      start,
      end: (self) => {
        const value = endRef.current;
        return typeof value === "function" ? value(self) : value;
      },
      invalidateOnRefresh: true,
      refreshPriority,
      onUpdate: sync,
      onEnter: sync,
      onEnterBack: sync,
      onLeave: hideHint,
      onLeaveBack: hideHint,
      onRefresh: sync,
    });

    sync(st);

    return () => {
      fadeTween?.kill();
      st.kill();
    };
  }, [triggerRef, start, hideAfter, refreshPriority, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={["pointer-events-none opacity-0", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ScrollDownHint
        label={label}
        compact={compact}
        compactOnMobile={compactOnMobile}
        direction={direction}
      />
    </div>
  );
}
