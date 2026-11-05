"use client";

import Image from "next/image";
import { BUNGALOW_POOL } from "../content";

export function PoolSection() {
  return (
    <section
      aria-label="Spring-fed natural pool"
      className="relative w-full overflow-hidden bg-[#717171]"
    >
      <div className="relative aspect-[390/280] min-h-[320px] w-full md:aspect-[1440/764] md:min-h-[480px] lg:min-h-[640px]">
        <Image
          src={BUNGALOW_POOL.image.src}
          alt={BUNGALOW_POOL.image.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-black/15" />

        <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
          <span className="inline-flex items-center justify-center rounded-full bg-cream/16 px-4 py-2.5 font-secondary text-xs font-medium uppercase leading-[150%] tracking-[0.2px] text-cream shadow-[0_4px_10px_0] shadow-black/8 ring-1 ring-inset ring-cream/32 backdrop-blur-[5px]">
            {BUNGALOW_POOL.label}
          </span>
        </div>
      </div>
    </section>
  );
}
