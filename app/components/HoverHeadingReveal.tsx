"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  type ComponentProps,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

gsap.registerPlugin(SplitText);

const H2_DURATION = 1.25;
const H2_STAGGER = 0.2;
const H2_EASE = "sine.out";
const HIDE_DURATION = 0.25;

const hiddenWordVars = {
  opacity: 0,
  filter: "blur(10px)",
} as const;

const visibleWordVars = {
  opacity: 1,
  filter: "blur(0px)",
} as const;

export type HoverHeadingRevealHandle = {
  play: (opts?: { delay?: number }) => void;
  hide: () => void;
};

type HeadingTag = "h1" | "h2";

export type HoverHeadingRevealProps = ComponentProps<"h2"> & {
  as?: HeadingTag;
  enabled?: boolean;
};

export const HoverHeadingReveal = forwardRef<
  HoverHeadingRevealHandle,
  HoverHeadingRevealProps
>(function HoverHeadingReveal(
  { as: Tag = "h2", className, children, enabled = true, ...props },
  ref,
) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const reducedMotionRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!headingRef.current || !enabled) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedMotionRef.current = reducedMotion;

    if (reducedMotion) {
      gsap.set(headingRef.current, { opacity: 0 });
      return;
    }

    let cancelled = false;
    let ctx: gsap.Context | undefined;
    let split: SplitText | undefined;

    const setup = () => {
      if (cancelled || !headingRef.current) return;

      ctx = gsap.context(() => {
        split = SplitText.create(headingRef.current!, {
          type: "words",
          autoSplit: true,
          tag: "span",
          wordsClass: "inline-block",
          onSplit(self) {
            splitRef.current = self;
            if (!self.words.length) return;
            gsap.set(self.words, hiddenWordVars);
          },
        });
        splitRef.current = split ?? null;
      }, headingRef);
    };

    const fonts = document.fonts;
    if (fonts?.status === "loaded") {
      setup();
    } else if (fonts?.ready) {
      fonts.ready.then(setup);
    } else {
      setup();
    }

    return () => {
      cancelled = true;
      tweenRef.current?.kill();
      tweenRef.current = null;
      ctx?.revert();
      split?.revert();
      splitRef.current = null;
    };
  }, [enabled]);

  useImperativeHandle(ref, () => ({
    play: (opts) => {
      tweenRef.current?.kill();
      tweenRef.current = null;

      if (!enabledRef.current) return;

      if (reducedMotionRef.current) {
        if (headingRef.current) gsap.set(headingRef.current, { opacity: 1 });
        return;
      }

      const words = splitRef.current?.words;
      if (!words?.length) return;

      tweenRef.current = gsap.to(words, {
        ...visibleWordVars,
        duration: H2_DURATION,
        ease: H2_EASE,
        stagger: H2_STAGGER,
        delay: opts?.delay ?? 0,
      });
    },
    hide: () => {
      tweenRef.current?.kill();
      tweenRef.current = null;

      if (!enabledRef.current) return;

      if (reducedMotionRef.current) {
        if (headingRef.current) gsap.set(headingRef.current, { opacity: 0 });
        return;
      }

      const words = splitRef.current?.words;
      if (!words?.length) return;

      tweenRef.current = gsap.to(words, {
        ...hiddenWordVars,
        duration: HIDE_DURATION,
        ease: H2_EASE,
        stagger: 0,
      });
    },
  }));

  return (
    <Tag ref={headingRef} className={className} {...props}>
      {children}
    </Tag>
  );
});

HoverHeadingReveal.displayName = "HoverHeadingReveal";
