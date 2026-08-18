"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";
import { refreshScrollTriggers } from "@/lib/scroll-refresh";
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

  useLayoutEffect(() => {
    if (!ready) return;
    refreshScrollTriggers();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <VillaSection />
      <ForestExperienceLocationStack />
    </>
  );
}
