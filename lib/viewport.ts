/**
 * Stable viewport height for full-bleed sections and ScrollTrigger distances.
 *
 * On mobile browsers, `window.innerHeight` and CSS `100vh` change when the
 * URL/toolbars show or hide. CSS `svh` (small viewport height) stays fixed,
 * so layout and scroll math don't jump mid-scroll.
 */

let cachedSvh = 0;
let listenersBound = false;

function measureSvh(): number {
  if (typeof document === "undefined") return 0;

  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:0;top:0;height:100svh;width:0;pointer-events:none;visibility:hidden";
  document.documentElement.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();

  cachedSvh = height > 0 ? height : window.innerHeight;
  return cachedSvh;
}

function ensureResizeListeners() {
  if (typeof window === "undefined" || listenersBound) return;
  listenersBound = true;

  let lastWidth = window.innerWidth;

  const refreshIfLayoutChanged = () => {
    const width = window.innerWidth;
    // Ignore vertical-only changes from mobile browser chrome.
    if (width === lastWidth && cachedSvh > 0) return;
    lastWidth = width;
    cachedSvh = 0;
    measureSvh();
  };

  window.addEventListener("resize", refreshIfLayoutChanged);
  window.addEventListener("orientationchange", () => {
    lastWidth = 0;
    cachedSvh = 0;
    measureSvh();
  });
}

/** Returns the CSS small-viewport height in px (stable while scrolling on mobile). */
export function getStableViewportHeight(): number {
  if (typeof window === "undefined") return 0;
  ensureResizeListeners();
  if (cachedSvh > 0) return cachedSvh;
  return measureSvh();
}
