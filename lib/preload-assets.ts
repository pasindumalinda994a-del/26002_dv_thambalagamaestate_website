export const HERO_POSTER_SRC = "/home/hero-poster.webp";

export const HERO_VIDEO_SRC = "/video/home-hero-desktop.mp4";
export const HERO_VIDEO_MOBILE_SRC = "/video/home-hero-mobile.mp4";

export const PRELOADER_LOGO_SRC = "/logo/primary.png";

export const BUNGALOW_HERO_SRC = "/bungalow/hero.webp";
export const BUNGALOW_HERO_DESKTOP_SRC =
  "/bungalow/WhatsApp Image 2026-08-18 at 19.58.21.jpeg";
export const EXPERIENCES_HERO_SRC = "/forest/why-visit.webp";
export const FOREST_HERO_SRC = "/forest/hero.webp";
export const GALLERY_HERO_SRC = "/gallery/main.webp";

/** First-paint assets for the home preloader — not the whole page. */
export const HOME_CRITICAL_ASSETS = [PRELOADER_LOGO_SRC] as const;

function normalizePath(pathname: string) {
  const path = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function criticalAssetsForPath(pathname: string): readonly string[] {
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  switch (normalizePath(pathname)) {
    case "/bungalow":
      return [
        isMobile ? BUNGALOW_HERO_SRC : BUNGALOW_HERO_DESKTOP_SRC,
        PRELOADER_LOGO_SRC,
      ];
    case "/experiences":
      return [EXPERIENCES_HERO_SRC, PRELOADER_LOGO_SRC];
    case "/forest":
      return [FOREST_HERO_SRC, PRELOADER_LOGO_SRC];
    case "/gallery":
      return [GALLERY_HERO_SRC, PRELOADER_LOGO_SRC];
    default:
      return HOME_CRITICAL_ASSETS;
  }
}
