"use client";

import Image from "next/image";
import { H2 } from "../../components/H2";
import { Paragraph } from "../../components/Paragraph";
import { EXPERIENCES_WATERFALL } from "../content";

export function WaterfallSection() {
  return (
    <section
      aria-label="Forest bathing by private waterfalls"
      className="flex min-w-0 flex-col gap-8 md:gap-10"
    >
      <div className="flex min-w-0 flex-col gap-3 px-4 md:gap-6 md:px-8">
        <H2 className="w-full max-w-full break-words uppercase text-deep-forest !text-[clamp(24px,3.75vw,54px)]">
          {EXPERIENCES_WATERFALL.headline}
        </H2>
        <Paragraph className="w-full max-w-full text-forest-green leading-[150%] tracking-[0.2px]">
          {EXPERIENCES_WATERFALL.body}
        </Paragraph>
      </div>

      <div className="relative w-full max-w-full overflow-hidden bg-[#717171]">
        <div className="relative aspect-[390/424] min-h-[320px] w-full max-w-full md:aspect-[1440/764] md:min-h-[480px] lg:min-h-[640px]">
          <Image
            src={EXPERIENCES_WATERFALL.image.src}
            alt={EXPERIENCES_WATERFALL.image.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-black/15" />

          <div className="absolute right-4 top-4 z-10 max-w-[calc(100%-2rem)] md:right-8 md:top-8">
            <span className="inline-flex max-w-full items-center justify-center rounded-full bg-cream/16 px-2 py-1.5 font-secondary text-[10px] font-medium uppercase leading-[150%] tracking-[0.2px] text-cream shadow-[0_4px_10px_0] shadow-black/8 ring-1 ring-inset ring-cream/32 backdrop-blur-[5px] md:px-4 md:py-2.5 md:text-xs">
              {EXPERIENCES_WATERFALL.label}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
