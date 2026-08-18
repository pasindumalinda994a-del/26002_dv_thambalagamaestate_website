"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useMemo, useRef } from "react";
import { H1 } from "../../components/H1";
import { ScrollDownHint } from "../../components/ScrollDownHint";
import type { GalleryDisplayImage } from "@/lib/gallery/types";

const HEADLINE = (
  <>
    A glimpse beyond the
    <br />
    border.
  </>
);

/** Same cell the desktop zoom focuses (row 2, center). */
const FOCUS_ID = "static-4";

const CELL_CLASS =
  "relative min-w-0 overflow-hidden bg-sage-muted/25";

type CellAspect = "4/5" | "16/10";

type GridCell = {
  item: GalleryDisplayImage;
  span: 1 | 2;
  aspect: CellAspect;
};

const ASPECT_CLASS: Record<CellAspect, string> = {
  "4/5": "aspect-4/5",
  "16/10": "aspect-16/10",
};

function heroImage(images: GalleryDisplayImage[]) {
  if (images.length === 0) return null;
  const focus = images.find((img) => img.id === FOCUS_ID);
  return focus ?? images[Math.min(4, images.length - 1)] ?? images[0];
}

/**
 * Repeating 5-image module: two even 4:5 rows, then a full-width 16:10.
 * Leftovers: 1 stays left; 2 = one pair; 3 = pair + full; 4 = two pairs.
 */
function pushPair(cells: GridCell[], items: GalleryDisplayImage[], start: number, count: number) {
  for (let n = 0; n < count; n++) {
    const item = items[start + n];
    if (item) cells.push({ item, span: 1, aspect: "4/5" });
  }
}

function gridCells(items: GalleryDisplayImage[]): GridCell[] {
  const cells: GridCell[] = [];
  let i = 0;

  while (i < items.length) {
    const remaining = items.length - i;

    if (remaining >= 5) {
      pushPair(cells, items, i, 4);
      const full = items[i + 4];
      if (full) cells.push({ item: full, span: 2, aspect: "16/10" });
      i += 5;
      continue;
    }

    if (remaining === 4) {
      pushPair(cells, items, i, 4);
      break;
    }

    if (remaining === 3) {
      pushPair(cells, items, i, 2);
      const full = items[i + 2];
      if (full) cells.push({ item: full, span: 2, aspect: "16/10" });
      break;
    }

    if (remaining === 2) {
      pushPair(cells, items, i, 2);
      break;
    }

    const last = items[i];
    if (last) cells.push({ item: last, span: 1, aspect: "4/5" });
    break;
  }

  return cells;
}

function GalleryCell({
  item,
  span,
  aspect,
  sizes,
  priority,
  onSelect,
}: {
  item: GalleryDisplayImage;
  span: 1 | 2;
  aspect: CellAspect;
  sizes: string;
  priority?: boolean;
  onSelect: (item: GalleryDisplayImage) => void;
}) {
  return (
    <button
      type="button"
      data-fade-in
      aria-label={item.alt || "View gallery image"}
      onClick={() => onSelect(item)}
      className={`${CELL_CLASS} ${ASPECT_CLASS[aspect]} ${span === 2 ? "col-span-2" : ""} cursor-pointer appearance-none border-0 p-0`}
    >
      <Image
        src={item.src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority}
        unoptimized={item.src.startsWith("/api/")}
      />
    </button>
  );
}

export function GalleryMobile({
  items,
  onSelect,
}: {
  items: GalleryDisplayImage[];
  onSelect: (item: GalleryDisplayImage) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hero = heroImage(items);
  const cells = useMemo(() => gridCells(items), [items]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bgImage = bgImageRef.current;
    if (!section || !bgImage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(bgImage, {
        transformOrigin: "center center",
        scale: 1.2,
      });
    }, section);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    const frames = root.querySelectorAll<HTMLElement>("[data-fade-in]");
    if (!frames.length) return;

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(frames, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(frames, { opacity: 0 });

      let i = 0;
      while (i < cells.length) {
        const frame = frames[i];
        if (!frame) break;

        if (cells[i]?.span === 2) {
          gsap.to(frame, {
            opacity: 1,
            duration: 1.4,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: frame,
              start: "top 75%",
              toggleActions: "play none none reset",
            },
          });
          i += 1;
          continue;
        }

        const pair: HTMLElement[] = [frame];
        const next = frames[i + 1];
        if (cells[i + 1]?.span === 1 && next) pair.push(next);

        gsap.to(pair, {
          opacity: 1,
          duration: 1.4,
          ease: "power1.inOut",
          stagger: pair.length > 1 ? 0.18 : 0,
          scrollTrigger: {
            trigger: frame,
            start: "top 75%",
            toggleActions: "play none none reset",
          },
        });
        i += pair.length;
      }
    }, root);

    return () => ctx.revert();
  }, [cells]);

  return (
    <div className="relative w-full bg-deep-forest">
      <section
        ref={sectionRef}
        aria-label="Gallery hero"
        className="relative mb-2 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#B3B3B3]"
      >
        <div className="absolute inset-0">
          {hero ? (
            <div ref={bgImageRef} className="absolute inset-0">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                quality={75}
                sizes="100vw"
                className="object-cover"
                unoptimized={hero.src.startsWith("/api/")}
              />
            </div>
          ) : null}
          <div aria-hidden className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 flex w-full min-w-0 flex-col items-center justify-center px-4 text-center">
          <H1 className="max-w-[1067px] overflow-hidden uppercase text-cream">
            {HEADLINE}
          </H1>
        </div>

        <div className="absolute inset-x-0 bottom-20 z-10 flex justify-center">
          <ScrollDownHint />
        </div>
      </section>

      <div ref={gridRef} className="grid grid-cols-2 gap-2">
        {cells.map((cell, index) => (
          <GalleryCell
            key={cell.item.id}
            item={cell.item}
            span={cell.span}
            aspect={cell.aspect}
            sizes={cell.span === 2 ? "100vw" : "50vw"}
            priority={index < 2}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
