"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "../content";

type ForestTocProps = {
  items: TocItem[];
};

export function ForestToc({ items }: ForestTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.25, 0.5],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Guide sections"
      className="lg:sticky lg:top-20 lg:self-start"
    >
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id} className="shrink-0 lg:w-full">
              <a
                href={`#${item.id}`}
                className={[
                  "flex items-center justify-between gap-2 px-2 py-1 font-secondary text-base font-medium leading-[150%] tracking-[0.2px] transition-colors",
                  isActive ? "text-tan" : "text-forest-green hover:text-tan",
                ].join(" ")}
                onClick={() => setActiveId(item.id)}
              >
                <span className="whitespace-nowrap lg:whitespace-normal">
                  {item.label}
                </span>
                <TocChevron className="hidden size-6 shrink-0 rotate-90 lg:block" />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TocChevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6 14L12 8L18 14"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
