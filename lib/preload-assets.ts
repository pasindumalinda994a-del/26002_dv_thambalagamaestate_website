export const HERO_BG_SRC =
  "/homepageimages/DSC_0471.jpg_2K_202607261120.webp";

export const HERO_VIDEO_SRC = "/video/hero%20video%205.mp4";

export const PRELOADER_LOGO_SRC = "/Logo/ThambalagamaLogo.png";

export const BUNGALOW_HERO_SRC = "/balgalowpageimages/0C8A9933.webp";
export const EXPERIENCES_HERO_SRC = "/forestpageimages/why-visit.webp";
export const FOREST_HERO_SRC = "/forestpageimages/forest-hero.webp";
export const GALLERY_HERO_SRC = "/gallery/Gallery%20Image%207.webp";

/** First-paint assets for the home preloader — not the whole page. */
export const HOME_CRITICAL_ASSETS = [
  // HERO_BG_SRC, // commented while the hero uses video
  PRELOADER_LOGO_SRC,
] as const;

function normalizePath(pathname: string) {
  const path = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function criticalAssetsForPath(pathname: string): readonly string[] {
  switch (normalizePath(pathname)) {
    case "/bungalow":
      return [BUNGALOW_HERO_SRC, PRELOADER_LOGO_SRC];
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
