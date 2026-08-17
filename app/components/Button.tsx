"use client";

import gsap from "gsap";
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { TransitionLink } from "./TransitionLink";

const LABEL_DURATION = 0.35;
const LABEL_STAGGER = 0.02;
const LABEL_EASE = "power2.out";

export type ButtonVariant = "dark" | "light" | "glass";
export type ButtonSize = "large" | "medium" | "small";

export type ButtonProps = ComponentProps<"button"> & {
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  target?: string;
  rel?: string;
  showArrow?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  large: "px-[18px] py-[12px] text-sm",
  medium: "px-4 py-2.5 text-xs",
  small: "px-3.5 py-2 text-[10px]",
};

const arrowSize: Record<ButtonSize, number> = {
  large: 24,
  medium: 20,
  small: 18,
};

const variantClasses: Record<ButtonVariant, string> = {
  dark: [
    "bg-forest-green text-cream",
    "disabled:bg-deep-forest disabled:opacity-24 disabled:pointer-events-none",
    "aria-disabled:bg-deep-forest aria-disabled:opacity-24 aria-disabled:pointer-events-none",
  ].join(" "),
  light: [
    "bg-cream text-forest-green border border-transparent",
    "disabled:bg-cream/64 disabled:border-cream/32 disabled:opacity-36 disabled:pointer-events-none",
    "aria-disabled:bg-cream/64 aria-disabled:border-cream/32 aria-disabled:opacity-36 aria-disabled:pointer-events-none",
  ].join(" "),
  glass: [
    "bg-cream/16 text-cream border border-cream/32 backdrop-blur-[5px]",
    "disabled:bg-cream/32 disabled:opacity-40 disabled:pointer-events-none",
    "aria-disabled:bg-cream/32 aria-disabled:opacity-40 aria-disabled:pointer-events-none",
  ].join(" "),
};

const trackTransition =
  "transition-transform duration-300 ease-out motion-reduce:transition-none";

function ArrowIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M13 18L19 12L13 6M19 12L5 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ButtonLabel({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const primaryRef = useRef<HTMLSpanElement>(null);
  const duplicateRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const primary = primaryRef.current;
    const duplicate = duplicateRef.current;
    if (!wrap || !primary || !duplicate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parent = wrap.closest<HTMLElement>(".group");
    if (!parent) return;

    let cancelled = false;
    let armed = false;
    let ctx: gsap.Context | undefined;
    let splitPrimary: InstanceType<typeof import("gsap/SplitText").SplitText> | undefined;
    let splitDuplicate: InstanceType<typeof import("gsap/SplitText").SplitText> | undefined;
    let hoverTl: gsap.core.Timeline | undefined;
    let play: (() => void) | undefined;
    let reverse: (() => void) | undefined;
    let onFocusOut: ((event: FocusEvent) => void) | undefined;

    const setup = async () => {
      if (cancelled || armed || !primaryRef.current || !duplicateRef.current) {
        return;
      }
      armed = true;

      const { SplitText } = await import("gsap/SplitText");
      if (cancelled || !primaryRef.current || !duplicateRef.current) return;

      if (document.fonts?.status !== "loaded" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled || !primaryRef.current || !duplicateRef.current) return;

      gsap.registerPlugin(SplitText);

      ctx = gsap.context(() => {
        splitPrimary = SplitText.create(primary, {
          type: "chars",
          smartWrap: true,
          tag: "span",
          charsClass: "inline-block",
        });
        splitDuplicate = SplitText.create(duplicate, {
          type: "chars",
          smartWrap: true,
          tag: "span",
          charsClass: "inline-block",
        });

        if (!splitPrimary.chars.length || !splitDuplicate.chars.length) return;

        duplicate.classList.remove("translate-y-full");
        gsap.set(splitDuplicate.chars, { yPercent: 100 });

        hoverTl = gsap.timeline({ paused: true });
        hoverTl
          .to(
            splitPrimary.chars,
            {
              yPercent: -100,
              duration: LABEL_DURATION,
              ease: LABEL_EASE,
              stagger: LABEL_STAGGER,
            },
            0,
          )
          .to(
            splitDuplicate.chars,
            {
              yPercent: 0,
              duration: LABEL_DURATION,
              ease: LABEL_EASE,
              stagger: LABEL_STAGGER,
            },
            0,
          );
      }, wrap);

      play = () => hoverTl?.play();
      reverse = () => hoverTl?.reverse();
      onFocusOut = (event: FocusEvent) => {
        if (!parent.contains(event.relatedTarget as Node)) reverse?.();
      };

      parent.addEventListener("pointerenter", play);
      parent.addEventListener("pointerleave", reverse);
      parent.addEventListener("focusin", play);
      parent.addEventListener("focusout", onFocusOut);
      play();
    };

    const arm = () => {
      void setup();
    };

    parent.addEventListener("pointerenter", arm);
    parent.addEventListener("focusin", arm);

    return () => {
      cancelled = true;
      parent.removeEventListener("pointerenter", arm);
      parent.removeEventListener("focusin", arm);
      if (play && reverse && onFocusOut) {
        parent.removeEventListener("pointerenter", play);
        parent.removeEventListener("pointerleave", reverse);
        parent.removeEventListener("focusin", play);
        parent.removeEventListener("focusout", onFocusOut);
      }
      ctx?.revert();
      splitPrimary?.revert();
      splitDuplicate?.revert();
    };
  }, [children]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex overflow-hidden whitespace-nowrap [clip-path:inset(0)]"
    >
      <span ref={primaryRef} className="block">
        {children}
      </span>
      <span
        ref={duplicateRef}
        className="absolute inset-0 block translate-y-full"
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
}

function ButtonArrow({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden [clip-path:inset(0)]"
      style={{ width: size, height: size }}
    >
      <span
        className={`absolute inset-0 flex ${trackTransition} group-hover:translate-x-full motion-reduce:group-hover:translate-x-0`}
      >
        <ArrowIcon size={size} />
      </span>
      <span
        className={`absolute inset-0 flex -translate-x-full ${trackTransition} group-hover:translate-x-0 motion-reduce:translate-x-0`}
        aria-hidden
      >
        <ArrowIcon size={size} />
      </span>
    </span>
  );
}

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return [
    "group inline-flex items-center justify-center gap-2",
    sizeClasses[size],
    variantClasses[variant],
    "font-secondary font-medium uppercase tracking-[0.2px] leading-[1.5]",
    "shadow-[0_4px_10px_0] shadow-black/8",
    "transition-[background-color,border-color,opacity,color] duration-300",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function ButtonContent({
  children,
  size,
  showArrow,
}: {
  children: ReactNode;
  size: ButtonSize;
  showArrow: boolean;
}) {
  return (
    <>
      <ButtonLabel>{children}</ButtonLabel>
      {showArrow ? <ButtonArrow size={arrowSize[size]} /> : null}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      children,
      type = "button",
      href,
      variant = "dark",
      size = "large",
      target,
      rel,
      showArrow = true,
      disabled,
      ...props
    },
    ref,
  ) {
    const classes = buttonClasses(variant, size, className);
    const content = (
      <ButtonContent size={size} showArrow={showArrow}>
        {children}
      </ButtonContent>
    );

    if (href) {
      const isDisabled = Boolean(disabled);
      return (
        <TransitionLink
          href={isDisabled ? "#" : href}
          target={target}
          rel={rel}
          className={classes}
          aria-disabled={isDisabled || undefined}
          onClick={isDisabled ? (e) => e.preventDefault() : undefined}
        >
          {content}
        </TransitionLink>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {content}
      </button>
    );
  },
);
