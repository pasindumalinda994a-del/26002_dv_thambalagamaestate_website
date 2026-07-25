import type { LenisOptions } from "lenis";

/**
 * Lenis smooth-scroll settings for this site.
 *
 * Lenis has two animation modes (pick one — they do not combine for wheel scroll):
 *
 * 1. Lerp mode (current): set `lerp` to a value between 0 and 1.
 *    Each frame, scroll moves a fraction of the remaining distance.
 *    Lower = softer, floatier, more cinematic. Higher = snappier, closer to native.
 *
 * 2. Duration mode: set `lerp` to 0 (or omit it) and use `duration` + `easing`.
 *    Each wheel tick plays a timed ease-out. More predictable, less "infinite glide".
 *
 * While `lerp` is active, `duration` and `easing` are ignored for normal scrolling.
 *
 * Quick presets (lerp / wheelMultiplier):
 *   Snappy:     0.12 / 1.0
 *   Balanced:   0.10 / 1.0  (Lenis defaults)
 *   Cinematic:  0.07 / 0.85  (current — slower, silkier glide)
 *
 * Used by app/components/SmoothScroll.tsx, which drives Lenis via the GSAP ticker.
 */
export const LENIS_OPTIONS: LenisOptions = {
  /**
   * Linear interpolation — how fast scroll position catches up each frame (0–1).
   * Think of it as the "weight" of the page.
   *   0.05 = very floaty / film-like (can feel laggy)
   *   0.07 = cinematic (current)
   *   0.10 = Lenis default / balanced
   *   0.15+ = snappy, near-native
   * When set, `duration` and `easing` below are not used for wheel scroll.
   */
  lerp: 0.03,

  /**
   * Smooth mouse-wheel and trackpad input instead of jumping instantly.
   * Set false only if you want native wheel behavior with Lenis still running.
   */
  smoothWheel: true,

  /**
   * How far the page moves per wheel notch or trackpad flick.
   *   1.0 = default speed
   *   0.85 = slower, more deliberate / premium (current)
   *   0.75 = very slow, highly controlled
   *   1.2+ = faster than default
   */
  wheelMultiplier: 0.55,

  /**
   * Same as wheelMultiplier but for touch gestures.
   * Only applies when syncTouch is true — we keep syncTouch false so
   * phones/tablets use native scroll (feels more natural on mobile).
   */
  touchMultiplier: 1.5,

  /**
   * Apply Lenis smoothing on touch devices.
   * false = native mobile scroll (recommended for marketing sites).
   * true = Lenis-smoothed touch (can feel sluggish on phones).
   */
  syncTouch: false,

  /**
   * Let Lenis run its own requestAnimationFrame loop.
   * Must stay false here — SmoothScroll.tsx already calls lenis.raf()
   * from the GSAP ticker. Setting true would double-drive Lenis.
   */
  autoRaf: false,

  /**
   * Smooth-scroll to in-page anchor links (e.g. href="#section").
   * true = Lenis handles hash navigation with the same lerp feel as wheel scroll.
   * Can also be an object: { duration: 1.5, easing: ... } for custom anchor jumps.
   */
  anchors: true,

  // duration and easing are omitted — unused while lerp > 0.
  // To use duration mode instead, remove lerp and set e.g.:
  //   duration: 1.2,
  //   easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
};
