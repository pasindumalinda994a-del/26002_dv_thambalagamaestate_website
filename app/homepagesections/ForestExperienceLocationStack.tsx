"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { refreshScrollTriggers } from "@/lib/scroll-refresh";
import { CTASection } from "./CTASection";
import { ExperienceSection } from "./Experience Section";
import { FooterSection } from "./Footer Section";
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
        refreshScrollTriggers();
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
      <CTASection ready={locationReady} />
      <FooterSection />
    </div>
  );
}
