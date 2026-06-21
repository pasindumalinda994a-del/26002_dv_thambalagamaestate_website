"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { ExperienceSection } from "./Experience Section";
import { ForestSection } from "./Forest Section";
import { LocationSection } from "./LocationSection";

function useOverlayReady(ref: RefObject<HTMLElement | null>) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const markReady = () => {
      if (el.offsetHeight > 0) {
        setReady(true);
        ScrollTrigger.refresh();
        return true;
      }
      return false;
    };

    if (markReady()) return;

    const resizeObserver = new ResizeObserver(() => {
      if (markReady()) resizeObserver.disconnect();
    });
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return ready;
}

export function ForestExperienceLocationStack() {
  const experienceRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const experienceReady = useOverlayReady(experienceRef);
  const locationReady = useOverlayReady(locationRef);

  return (
    <div className="relative isolate">
      <ForestSection
        overlayTargetRef={experienceRef}
        overlayReady={experienceReady}
      />
      <ExperienceSection
        ref={experienceRef}
        overlayTargetRef={locationRef}
        overlayReady={locationReady}
      />
      <LocationSection ref={locationRef} ready={locationReady} />
    </div>
  );
}
