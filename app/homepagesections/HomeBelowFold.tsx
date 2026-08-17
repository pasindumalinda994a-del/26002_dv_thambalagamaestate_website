"use client";

import dynamic from "next/dynamic";
import { usePreloaderComplete } from "../components/SitePreloader";

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
  const ready = usePreloaderComplete();
  if (!ready) return null;

  return (
    <>
      <VillaSection />
      <ForestExperienceLocationStack />
    </>
  );
}
