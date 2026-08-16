"use client";

import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryDisplayImage } from "@/lib/gallery/types";

export function GalleryLightbox({
  image,
  onClose,
}: {
  image: GalleryDisplayImage | null;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const open = image !== null;

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

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
    requestAnimationFrame(() => closeBtnRef.current?.focus());
  }, [open, image?.id]);

  if (!mounted || !image) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-600"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || "Gallery image"}
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Close image"
        className="absolute inset-0 bg-deep-forest/92"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 md:p-8">
        <div className="pointer-events-auto relative h-full w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            className="object-contain"
            unoptimized={image.src.startsWith("/api/")}
            priority
          />
        </div>
      </div>

      <button
        ref={closeBtnRef}
        type="button"
        aria-label="Close image"
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center bg-cream text-deep-forest transition-opacity hover:opacity-80 md:top-8 md:right-8"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M1 1L13 13M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
