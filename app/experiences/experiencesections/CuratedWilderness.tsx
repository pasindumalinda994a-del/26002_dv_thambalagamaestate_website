"use client";

import { H2 } from "../../components/H2";
import { Paragraph } from "../../components/Paragraph";
import { EXPERIENCES_INTRO } from "../content";

export function CuratedWilderness() {
  return (
    <section
      aria-label="Curated wilderness"
      className="flex min-w-0 flex-col gap-10 px-4 pt-12 md:gap-16 md:px-8 md:pt-20 lg:pt-28"
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 md:items-start">
        <H2 className="w-full max-w-[678px] break-words uppercase text-deep-forest !text-[clamp(36px,5.28vw,76px)]">
          {EXPERIENCES_INTRO.headline}
        </H2>
        <Paragraph className="w-full max-w-[698px] text-forest-green leading-[150%] tracking-[0.2px] md:pt-2">
          {EXPERIENCES_INTRO.body}
        </Paragraph>
      </div>
      <div
        aria-hidden
        className="h-px w-full bg-[#CFCBB1]"
      />
    </section>
  );
}
