"use client";

import dynamic from "next/dynamic";

const VillaSection = dynamic(() =>
  import("./Villa Section").then((mod) => ({ default: mod.VillaSection })),
);

const ForestExperienceLocationStack = dynamic(() =>
  import("./ForestExperienceLocationStack").then((mod) => ({
    default: mod.ForestExperienceLocationStack,
  })),
);

/** Below-fold home sections — separate client chunks from hero/header. */
export function HomeBelowFold() {
  return (
    <>
      <VillaSection />
      <ForestExperienceLocationStack />
    </>
  );
}
