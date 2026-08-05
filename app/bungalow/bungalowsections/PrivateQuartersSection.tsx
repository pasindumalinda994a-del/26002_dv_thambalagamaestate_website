"use client";

import Image from "next/image";
import { H2 } from "../../components/H2";
import { BUNGALOW_QUARTERS } from "../content";

function MarqueeSet({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0"
      aria-hidden={ariaHidden || undefined}
    >
      {BUNGALOW_QUARTERS.images.map((image) => (
        <div
          key={`${ariaHidden ? "dup-" : ""}${image.src}`}
          className="relative aspect-[468/326] w-[min(82vw,468px)] shrink-0 overflow-hidden bg-[#A6A6A6] mr-3 md:mr-0 md:w-[min(85vw,468px)]"
        >
          <Image
            src={image.src}
            alt={ariaHidden ? "" : image.alt}
            fill
            sizes="(max-width: 768px) 82vw, 468px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function PrivateQuartersSection() {
  return (
    <section
      aria-label="Private quarters"
      className="bg-deep-forest px-5 py-16 md:px-8 md:py-24"
    >
      <H2 className="mb-8 max-w-[678px] uppercase text-cream md:mb-14">
        {BUNGALOW_QUARTERS.headline}
      </H2>

      <div className="bungalow-marquee relative overflow-hidden md:-mx-8 md:w-[calc(100%+4rem)]">
        <div className="bungalow-marquee-track flex w-max">
          <MarqueeSet />
          <MarqueeSet ariaHidden />
        </div>
      </div>
    </section>
  );
}
