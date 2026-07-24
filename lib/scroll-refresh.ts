import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let configured = false;
let rafScheduled = false;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * One-time ScrollTrigger defaults for this site.
 * ignoreMobileResize avoids pin jumps when mobile browser chrome toggles.
 */
export function ensureScrollTriggerConfig() {
  if (configured || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  configured = true;
}

/** Coalesce many refresh callers into a single rAF refresh. */
export function refreshScrollTriggers() {
  if (typeof window === "undefined") return;
  ensureScrollTriggerConfig();
  if (rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(() => {
    rafScheduled = false;
    ScrollTrigger.refresh();
  });
}

/** Debounced refresh for resize / layout thrash. */
export function refreshScrollTriggersDebounced(delayMs = 150) {
  if (typeof window === "undefined") return;
  ensureScrollTriggerConfig();
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    refreshScrollTriggers();
  }, delayMs);
}
