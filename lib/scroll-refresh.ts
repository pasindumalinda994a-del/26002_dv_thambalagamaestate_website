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

type ScrollToHeroLenis = {
  scrollTo: (value: number, options?: { immediate?: boolean }) => void;
} | null | undefined;

/** Native + Lenis reset — Lenis is null on mobile, so window.scrollTo is required. */
export function scrollToHero(lenis?: ScrollToHeroLenis) {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true });
}

/** Keep the browser from restoring a mid-page Y after reload / image load. */
export function lockScrollRestoration() {
  if (typeof history === "undefined" || !("scrollRestoration" in history)) return;
  history.scrollRestoration = "manual";
}
