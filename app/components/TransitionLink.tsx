"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { usePageTransition } from "./PageTransitionProvider";

type TransitionLinkProps = ComponentProps<typeof Link>;

function shouldIntercept(href: TransitionLinkProps["href"], target?: string) {
  if (target === "_blank") return false;
  if (typeof href !== "string") return false;
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return false;
  }
  return true;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, onNavigate, target, ...props }, ref) {
    const { navigate } = usePageTransition();

    return (
      <Link
        ref={ref}
        href={href}
        target={target}
        {...props}
        onClick={onClick}
        onNavigate={(event) => {
          // Next's onNavigate event has preventDefault but no defaultPrevented flag.
          let prevented = false;
          onNavigate?.({
            preventDefault: () => {
              prevented = true;
              event.preventDefault();
            },
          });
          if (prevented) return;
          if (!shouldIntercept(href, target)) return;

          // Next.js App Router only honors preventDefault on onNavigate.
          event.preventDefault();
          navigate(href as string);
        }}
      />
    );
  },
);
