"use client";

import gsap from "gsap";
import { useLenis } from "lenis/react";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type NavLink = {
  href: string;
  label: string;
};

const overlayHidden = {
  opacity: 0,
  backdropFilter: "blur(0px)",
  WebkitBackdropFilter: "blur(0px)",
};

const overlayVisible = {
  opacity: 0.4,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const panelHidden = {
  opacity: 0,
  y: 24,
};

const panelVisible = {
  opacity: 1,
  y: 0,
};

export function HeaderMenuDrawer({
  open,
  onClose,
  onCheckAvailability,
  navLinks,
}: {
  open: boolean;
  onClose: () => void;
  onCheckAvailability: () => void;
  navLinks: readonly NavLink[];
}) {
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    tlRef.current?.kill();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const focusFirstLink = () => {
      requestAnimationFrame(() => {
        firstLinkRef.current?.focus();
      });
    };

    if (open) {
      if (reduceMotion) {
        gsap.set(overlay, overlayVisible);
        gsap.set(panel, panelVisible);
        focusFirstLink();
        return;
      }

      gsap.set(overlay, overlayHidden);
      gsap.set(panel, panelHidden);

      const tl = gsap.timeline({
        onComplete: focusFirstLink,
      });
      tlRef.current = tl;
      tl.to(
        overlay,
        { ...overlayVisible, duration: 0.85, ease: "power2.out" },
        0,
      );
      tl.to(
        panel,
        { ...panelVisible, duration: 0.55, ease: "power3.out" },
        0.08,
      );

      return () => {
        tl.kill();
      };
    }

    if (reduceMotion) {
      gsap.set(overlay, overlayHidden);
      gsap.set(panel, panelHidden);
      // Defer unmount so React finishes this layout pass first
      queueMicrotask(() => setMounted(false));
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    });
    tlRef.current = tl;
    tl.to(
      panel,
      { ...panelHidden, duration: 0.35, ease: "power2.in" },
      0,
    );
    tl.to(
      overlay,
      { ...overlayHidden, duration: 0.5, ease: "power2.inOut" },
      0.05,
    );

    return () => {
      tl.kill();
    };
  }, [open, mounted]);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[501]"
      role="presentation"
      aria-hidden={!open}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />

      <nav
        ref={panelRef}
        id="main-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        data-lenis-prevent
        className="absolute inset-0 flex flex-col bg-deep-forest will-change-transform"
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 font-secondary text-base font-medium uppercase tracking-[0.2px] text-cream">
          {navLinks.map(({ href, label }, index) => (
            <Link
              key={href}
              ref={index === 0 ? firstLinkRef : undefined}
              href={href}
              onClick={onClose}
              className="transition-opacity hover:opacity-80"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 justify-center px-4 pb-10 md:hidden">
          <button
            type="button"
            onClick={onCheckAvailability}
            className="inline-flex items-center gap-2 font-secondary text-[14px] font-medium uppercase tracking-[0.2px] text-cream transition-opacity hover:opacity-80"
          >
            Check Availability
            <span aria-hidden>→</span>
          </button>
        </div>
      </nav>
    </div>,
    document.body,
  );
}
