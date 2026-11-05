"use client";

import gsap from "gsap";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryDisplayImage } from "@/lib/gallery/types";

const OVERLAY_HIDDEN = {
  backdropFilter: "blur(0px)",
  WebkitBackdropFilter: "blur(0px)",
  backgroundColor: "rgba(0,0,0,0)",
};

const OVERLAY_VISIBLE = {
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  backgroundColor: "rgba(0,0,0,0.1)",
};

export function GalleryLightbox({
  image,
  onClose,
}: {
  image: GalleryDisplayImage | null;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const overlayRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const shownRef = useRef<GalleryDisplayImage | null>(image);
  const [portalReady, setPortalReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const open = image !== null;

  if (image) shownRef.current = image;
  const shown = image ?? shownRef.current;

  useLayoutEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (image) setMounted(true);
  }, [image]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const overlay = overlayRef.current;
    const frame = frameRef.current;
    const closeBtn = closeBtnRef.current;
    if (!overlay || !frame || !closeBtn) return;

    tlRef.current?.kill();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (open) {
      if (reduceMotion) {
        gsap.set(overlay, OVERLAY_VISIBLE);
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        gsap.set(closeBtn, { autoAlpha: 1, y: 0 });
        closeBtn.focus();
        return;
      }

      gsap.set(overlay, OVERLAY_HIDDEN);
      gsap.set(frame, {
        autoAlpha: 0,
        scale: 0.94,
        transformOrigin: "center center",
      });
      gsap.set(closeBtn, { autoAlpha: 0, y: -8 });

      const tl = gsap.timeline({
        onComplete: () => closeBtn.focus(),
      });
      tlRef.current = tl;
      tl.to(
        overlay,
        { ...OVERLAY_VISIBLE, duration: 0.45, ease: "power3.out" },
        0,
      );
      tl.to(
        frame,
        { autoAlpha: 1, scale: 1, duration: 0.55, ease: "power3.out" },
        0,
      );
      tl.to(
        closeBtn,
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.2,
      );

      return () => {
        tl.kill();
      };
    }

    if (reduceMotion) {
      gsap.set(overlay, OVERLAY_HIDDEN);
      gsap.set(frame, { autoAlpha: 0, scale: 0.94 });
      gsap.set(closeBtn, { autoAlpha: 0 });
      setMounted(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    });
    tlRef.current = tl;
    tl.to(
      closeBtn,
      { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" },
      0,
    );
    tl.to(
      frame,
      { autoAlpha: 0, scale: 0.94, duration: 0.35, ease: "power2.in" },
      0,
    );
    tl.to(
      overlay,
      { ...OVERLAY_HIDDEN, duration: 0.4, ease: "power2.in" },
      0,
    );

    return () => {
      tl.kill();
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [mounted, lenis]);

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

  if (!portalReady || !mounted || !shown) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-600"
      role="dialog"
      aria-modal="true"
      aria-label={shown.alt || "Gallery image"}
      data-lenis-prevent
    >
      <button
        ref={overlayRef}
        type="button"
        aria-label="Close image"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 md:p-8">
        <div
          ref={frameRef}
          className="pointer-events-auto relative will-change-transform"
        >
          <Image
            src={shown.src}
            alt={shown.alt}
            width={1920}
            height={1080}
            sizes="(max-width: 768px) 92vw, 80vw"
            className="h-auto max-h-[85dvh] w-auto max-w-[92vw] object-contain md:max-h-[88dvh] md:max-w-[80vw]"
            unoptimized={shown.src.startsWith("/api/")}
            priority
          />
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close image"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 flex size-11 items-center justify-center bg-cream text-deep-forest transition-opacity hover:opacity-80 md:top-3 md:right-3 md:size-9"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
