"use client";

import { useLenis } from "lenis/react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RefObject } from "react";
import { TransitionLink } from "./TransitionLink";

export type NavLink = {
  href: string;
  label: string;
};

export type DrawerAnimRefs = {
  panel: RefObject<HTMLElement | null>;
};

export function HeaderMenuDrawer({
  open,
  onClose,
  onCheckAvailability,
  navLinks,
  animRefs,
  onReady,
}: {
  open: boolean;
  onClose: () => void;
  onCheckAvailability: () => void;
  navLinks: readonly NavLink[];
  animRefs: DrawerAnimRefs;
  onReady?: () => void;
}) {
  const lenis = useLenis();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (mounted) onReady?.();
  }, [mounted, onReady]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => firstLinkRef.current?.focus());
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[501]"
      aria-hidden={!open}
    >
      {/* Under header: top-4 + ~4rem header height + 16px gap */}
      <div className="absolute inset-0 flex items-start justify-center px-5 pt-[calc(1rem+4rem+1rem)]">
        <nav
          ref={animRefs.panel}
          id="main-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          data-lenis-prevent
          className="w-full max-w-[480px] bg-deep-forest px-12 py-20"
          style={{
            opacity: 0,
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <p
            data-menu-item
            className="mb-4 font-secondary text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50"
          >
            Menu
          </p>

          <ul className="flex flex-col gap-2.5">
            {navLinks.map(({ href, label }, index) => (
              <li key={href} data-menu-item>
                <TransitionLink
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={href}
                  onClick={onClose}
                  className="font-secondary text-[22px] font-semibold uppercase leading-none tracking-[0.04em] text-cream transition-opacity hover:opacity-80"
                >
                  {label}
                </TransitionLink>
              </li>
            ))}
          </ul>

          <button
            data-menu-item
            type="button"
            onClick={onCheckAvailability}
            className="mt-8 flex w-full items-center justify-center gap-2 bg-cream px-4 py-3.5 font-secondary text-[13px] font-semibold uppercase tracking-[0.08em] text-deep-forest transition-opacity hover:opacity-90"
          >
            Check Availability
            <span aria-hidden>→</span>
          </button>

          <Link
            data-menu-item
            href="/admin/login"
            onClick={onClose}
            className="mt-4 flex w-full items-center justify-center font-secondary text-[12px] font-medium uppercase tracking-[0.12em] text-cream/60 transition-opacity hover:text-cream hover:opacity-100"
          >
            Dashboard Login
          </Link>
        </nav>
      </div>
    </div>,
    document.body,
  );
}
