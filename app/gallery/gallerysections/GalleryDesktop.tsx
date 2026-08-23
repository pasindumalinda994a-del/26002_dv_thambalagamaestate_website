"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { refreshScrollTriggers } from "@/lib/scroll-refresh";
import { H1 } from "../../components/H1";
import {
  HoverHeadingReveal,
  type HoverHeadingRevealHandle,
} from "../../components/HoverHeadingReveal";
import { ScrollDownHint } from "../../components/ScrollDownHint";
import type { GalleryDisplayImage } from "@/lib/gallery/types";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = (
  <>
    A glimpse beyond the
    <br />
    border.
  </>
);

/** Scroll distance (in vh) used only for the zoom-out phase. */
const ZOOM_RUNWAY_VH = 200;

/** Max horizontal drift per row during scroll-through (vw). */
const ROW_SHIFT_VW = 4;

/** Cycling flex ratios — seams never align row-to-row (screenshot brickwork).
 *  Row 2 (index 1) uses wider-center so the hero focus cell fits the screen cleanly. */
const ROW_PATTERNS: [number, number, number][] = [
  [1.4, 1.4, 0.8], // B — seams shift right
  [1, 1.6, 1], // A — wider center (hero / start focus)
  [0.8, 1.4, 1.4], // C — seams shift left
];

function chunkRows(
  items: GalleryDisplayImage[],
  size = 3,
): GalleryDisplayImage[][] {
  const rows: GalleryDisplayImage[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clamp = true,
) {
  const t = (value - inMin) / (inMax - inMin);
  const mapped = outMin + (outMax - outMin) * t;
  if (!clamp) return mapped;
  if (outMin < outMax) {
    return Math.min(outMax, Math.max(outMin, mapped));
  }
  return Math.min(outMin, Math.max(outMax, mapped));
}

function GalleryDesktopCell({
  item,
  flex,
  priority,
  onSelect,
}: {
  item: GalleryDisplayImage;
  flex: number;
  priority: boolean;
  onSelect: (item: GalleryDisplayImage) => void;
}) {
  const headingRef = useRef<HoverHeadingRevealHandle>(null);

  return (
    <button
      type="button"
      data-gallery-cell
      style={{ flex }}
      aria-label={item.alt || "View gallery image"}
      onClick={() => onSelect(item)}
      onMouseEnter={() => headingRef.current?.play()}
      onMouseLeave={() => headingRef.current?.hide()}
      className="group relative aspect-video min-w-0 cursor-pointer appearance-none overflow-hidden border-0 bg-sage-muted/25 p-0"
    >
      <Image
        data-gallery-img
        src={item.src}
        alt=""
        fill
        sizes="40vw"
        className="object-cover"
        priority={priority}
        unoptimized={item.src.startsWith("/api/")}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-2 bg-[linear-gradient(to_top,rgba(8,10,12,0.72)_0%,rgba(8,10,12,0.45)_40%,rgba(8,10,12,0.32)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:duration-0"
      />
      <div className="pointer-events-none absolute inset-0 z-3 flex items-center justify-center px-3">
        <HoverHeadingReveal
          ref={headingRef}
          as="h2"
          aria-hidden
          className="max-w-[96%] text-center font-space-grotesk text-[clamp(10px,0.95vw,13px)] font-medium uppercase leading-[130%] tracking-[0.2px] text-cream"
        >
          CLICK TO VIEW
        </HoverHeadingReveal>
      </div>
    </button>
  );
}

function GalleryGrid({
  items,
  priorityCount = 0,
  onSelect,
}: {
  items: GalleryDisplayImage[];
  priorityCount?: number;
  onSelect: (item: GalleryDisplayImage) => void;
}) {
  const rows = chunkRows(items);
  let cellIndex = 0;

  return (
    <div className="flex w-full flex-col gap-3 bg-deep-forest">
      {rows.map((rowItems, rowIndex) => {
        const pattern = ROW_PATTERNS[rowIndex % ROW_PATTERNS.length];

        return (
          <div
            key={`row-${rowIndex}`}
            data-gallery-row
            className="relative ml-[-5%] flex w-[110%] gap-3 will-change-transform"
          >
            {rowItems.map((item, colIndex) => {
              const index = cellIndex++;
              const flex = pattern[colIndex] ?? 1;

              return (
                <GalleryDesktopCell
                  key={item.id}
                  item={item}
                  flex={flex}
                  priority={index < priorityCount}
                  onSelect={onSelect}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function GalleryDesktop({
  items,
  onSelect,
}: {
  items: GalleryDisplayImage[];
  onSelect: (item: GalleryDisplayImage) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const spotlight = spotlightRef.current;
    const overlay = overlayRef.current;
    const headline = headlineRef.current;
    const scrollHint = scrollHintRef.current;

    if (!track || !spotlight || !overlay || !headline || !scrollHint) {
      return;
    }

    const imageEls =
      spotlight.querySelectorAll<HTMLElement>("[data-gallery-img]");
    const rows = spotlight.querySelectorAll<HTMLElement>("[data-gallery-row]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.registerPlugin(ScrollTrigger);

    if (reduceMotion) {
      gsap.set(spotlight, { scale: 1, y: 0 });
      gsap.set(imageEls, { scale: 1 });
      gsap.set(rows, { x: 0 });
      gsap.set(overlay, { opacity: 1 });
      gsap.set(scrollHint, { opacity: 1 });
      spotlight.style.pointerEvents = "auto";
      track.style.height = "auto";
      return;
    }

    spotlight.style.pointerEvents = "none";

    let metrics = {
      gridHeight: 0,
      viewHeight: 0,
      zoomRunway: 0,
      scrollRunway: 0,
      startScale: 3,
      startX: 0,
      startY: 0,
      rowShiftPx: 0,
    };

    const measure = () => {
      const prev = spotlight.style.transform;
      spotlight.style.transform = "none";
      gsap.set(rows, { x: 0 });

      const gridHeight = spotlight.scrollHeight;
      const viewHeight = window.innerHeight;
      const viewWidth = window.innerWidth;

      // 2nd row, 2nd cell — hero image that fills the screen at start.
      const focusRow = rows[1] ?? rows[0];
      const focus =
        focusRow?.querySelectorAll<HTMLElement>("[data-gallery-cell]")[1] ??
        spotlight.querySelector<HTMLElement>("[data-gallery-cell]");

      let startScale = 3;
      let startX = 0;
      let startY = 0;

      if (focus) {
        const spotRect = spotlight.getBoundingClientRect();
        const cellRect = focus.getBoundingClientRect();
        const cellW = cellRect.width;
        const cellH = cellRect.height;
        const focusCX = cellRect.left - spotRect.left + cellW / 2;
        const focusCY = cellRect.top - spotRect.top + cellH / 2;

        // Cover viewport with the focus cell (fit nicely, no letterboxing).
        startScale = Math.max(viewWidth / cellW, viewHeight / cellH);
        // Keep focus cell locked to viewport center while scaling (origin = cell center).
        startX = viewWidth / 2 - focusCX;
        startY = viewHeight / 2 - focusCY;

        gsap.set(spotlight, {
          transformOrigin: `${focusCX}px ${focusCY}px`,
        });
      }

      const zoomRunway = (ZOOM_RUNWAY_VH / 100) * viewHeight;
      const scrollRunway = Math.max(0, gridHeight - viewHeight);
      track.style.height = `${zoomRunway + scrollRunway}px`;

      spotlight.style.transform = prev;
      metrics = {
        gridHeight,
        viewHeight,
        zoomRunway,
        scrollRunway,
        startScale,
        startX,
        startY,
        rowShiftPx: (ROW_SHIFT_VW / 100) * viewWidth,
      };
      return metrics;
    };

    const ctx = gsap.context(() => {
      measure();

      gsap.set(spotlight, {
        scale: metrics.startScale,
        x: metrics.startX,
        y: metrics.startY,
      });
      gsap.set(rows, { x: 0 });
      gsap.set(imageEls, { scale: 1, transformOrigin: "center center" });
      gsap.set(overlay, { opacity: 1 });

      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate(self) {
          const {
            viewHeight,
            zoomRunway,
            scrollRunway,
            gridHeight,
            startScale,
            startX,
            startY,
            rowShiftPx,
          } = metrics;
          const total = zoomRunway + scrollRunway;
          if (total <= 0) return;

          const zoomEnd = zoomRunway / total;
          const p = self.progress;

          spotlight.style.pointerEvents = p >= zoomEnd ? "auto" : "none";

          if (p <= zoomEnd) {
            const zoomT = zoomEnd === 0 ? 1 : p / zoomEnd;
            // Scale only — hold x/y so the focus image stays centered the whole way.
            gsap.set(spotlight, {
              scale: lerp(startScale, 1, zoomT),
              x: startX,
              y: startY,
            });
            gsap.set(rows, { x: 0 });
          } else {
            const scrollT =
              scrollRunway === 0 ? 1 : (p - zoomEnd) / (1 - zoomEnd);
            const maxY = Math.max(0, gridHeight - viewHeight);
            // Release from centered focus into full-grid scroll.
            gsap.set(spotlight, {
              scale: 1,
              x: lerp(startX, 0, scrollT),
              y: lerp(startY, -maxY, scrollT),
            });

            // Odd rows left, even rows right — subtle alternating parallax.
            rows.forEach((row, i) => {
              const dir = i % 2 === 0 ? -1 : 1;
              gsap.set(row, { x: dir * rowShiftPx * scrollT });
            });
          }

          // Heading visible at start, fades out as the zoom-out begins.
          const fadeOut = mapRange(
            p,
            0.02,
            Math.min(0.28, zoomEnd * 0.55),
            0,
            1,
          );
          gsap.set(overlay, {
            opacity: lerp(1, 0, fadeOut),
            scale: lerp(1, 0.96, fadeOut),
          });
          gsap.set(scrollHint, {
            opacity: lerp(1, 0, fadeOut),
          });
        },
      });
    }, rootRef);

    const refresh = () => {
      measure();
      refreshScrollTriggers();
    };
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    const imgs = Array.from(spotlight.querySelectorAll("img"));
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", refresh, { once: true });
    });

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      ctx.revert();
    };
  }, [items.length]);

  return (
    <div ref={rootRef} className="relative w-full">
      <div ref={trackRef} className="relative w-full">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div ref={spotlightRef} className="w-full will-change-transform">
            <GalleryGrid items={items} priorityCount={6} onSelect={onSelect} />
          </div>

          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[linear-gradient(to_top,rgba(8,10,12,0.72)_0%,rgba(8,10,12,0.45)_40%,rgba(8,10,12,0.32)_100%)] px-6 text-center"
          >
            <H1
              ref={headlineRef}
              className="max-w-[18ch] overflow-hidden uppercase text-cream"
            >
              {HEADLINE}
            </H1>
          </div>

          <div
            ref={scrollHintRef}
            className="absolute inset-x-0 bottom-10 z-10 flex justify-center"
          >
            <ScrollDownHint />
          </div>
        </div>
      </div>
    </div>
  );
}
