"use client";

import Image from "next/image";
import { H1 } from "../../components/H1";
import { FOREST_HERO } from "../content";

export function ForestHero() {
  return (
    <section aria-label="Forest guide hero" className="flex flex-col gap-8 md:gap-10">
      <div className="px-5 md:px-8">
        <H1 className="max-w-[1202px] uppercase text-deep-forest !text-[clamp(24px,6.55vw,54px)]">
          {FOREST_HERO.headline}
        </H1>
      </div>

      <div className="flex flex-col gap-8 md:gap-[33px]">
        <div className="flex flex-nowrap items-center gap-3 overflow-x-auto px-5 md:gap-5 md:px-8">
          {FOREST_HERO.meta.map((item) => (
            <div
              key={item.label}
              className="flex shrink-0 items-center gap-1.5 font-secondary text-sm font-medium uppercase tracking-[0.2px]"
            >
              <span className="text-olive">{item.label}</span>
              <span className="text-olive" aria-hidden>
                •
              </span>
              <span className="text-deep-forest">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="relative h-[min(56vw,420px)] w-full overflow-hidden bg-[#B3B3B3] md:h-[665px]">
          <Image
            src={FOREST_HERO.heroImage.src}
            alt={FOREST_HERO.heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-8 border-b border-[#CFCBB1] px-5 pb-10 md:gap-12 md:px-8">
          <p className="max-w-[853px] font-secondary text-2xl font-bold leading-[130%] tracking-[0.2px] text-forest-green md:text-[36px]">
            {FOREST_HERO.introLead}
          </p>
          <p className="max-w-[853px] font-secondary text-xl font-normal leading-[130%] tracking-[0.2px] text-forest-green md:text-2xl">
            {FOREST_HERO.introSupport}
          </p>
        </div>
      </div>
    </section>
  );
}
