import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One-time ScrollTrigger defaults for this site.
 * ignoreMobileResize avoids pin jumps when mobile browser chrome toggles.
 */
let configured = false;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Higher refreshPriority = measured first on refresh.
 * Keep page-order descending so pin spacers above settle before sections below.
 */
export const ST_PRIORITY = {
  hero: 50,
  about: 40,
  villa: 30,
  forest: 20,
  experience: 10,
  cta: 0,
  h2: -5,
} as const;

export function ensureScrollTriggerConfig() {
  if (configured || typeof window === "undefined") return;
  configured = true;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * Debounced ScrollTrigger.refresh — coalesces bursts from ResizeObservers,
 * image loads, overlay readiness, and section mounts into one recalculation.
 */
export function refreshScrollTriggers(delayMs = 100) {
  ensureScrollTriggerConfig();
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, delayMs);
}
