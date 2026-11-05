"use client";

import dynamic from "next/dynamic";
import { useCallback, useLayoutEffect, useState } from "react";
import type { GalleryDisplayImage } from "@/lib/gallery/types";
import { GalleryLightbox } from "./GalleryLightbox";
import { GalleryMobile } from "./GalleryMobile";

const MOBILE_MQ = "(max-width: 767px)";

const GalleryDesktop = dynamic(() =>
  import("./GalleryDesktop").then((mod) => ({ default: mod.GalleryDesktop })),
);

export function GalleryHero({ images }: { images: GalleryDisplayImage[] }) {
  // Mobile-first so phones never mount the zoom grid / ScrollTrigger.
  const [isMobile, setIsMobile] = useState(true);
  const [activeImage, setActiveImage] = useState<GalleryDisplayImage | null>(
    null,
  );

  const closeLightbox = useCallback(() => setActiveImage(null), []);

  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div id="gallery-hero" className="relative w-full bg-deep-forest">
      {isMobile ? (
        <GalleryMobile items={images} onSelect={setActiveImage} />
      ) : (
        <GalleryDesktop items={images} onSelect={setActiveImage} />
      )}
      <GalleryLightbox image={activeImage} onClose={closeLightbox} />
    </div>
  );
}
