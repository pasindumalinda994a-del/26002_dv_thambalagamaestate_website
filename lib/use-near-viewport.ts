"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element comes within `rootMargin` of the viewport.
 *
 * Used to defer heavy ScrollTrigger/SplitText setup for below-the-fold
 * sections so hydration doesn't build every animation graph at once.
 * Arms well ahead of the section so pin spacing is in place before use.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "200% 0px",
) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;

    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref, rootMargin, near]);

  return near;
}
