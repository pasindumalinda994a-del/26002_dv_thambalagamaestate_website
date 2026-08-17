import type { Metadata } from "next";

const FALLBACK_SITE_URL = "http://localhost:3000";

export const SITE_NAME = "Thambalagama Estate";

export const SITE_KEYWORDS = [
  "Sinharaja Forest Sri Lanka",
  "Sri Lanka Rainforest",
  "Sri Lanka Tourism",
  "Sri Lanka Holidays",
  "Travel Sri Lanka",
] as const;

export const DEFAULT_OG_IMAGE = "/home/hero.webp";
export const FOREST_OG_IMAGE = "/forest/hero.webp";
export const BUNGALOW_OG_IMAGE = "/bungalow/hero.webp";
export const EXPERIENCES_OG_IMAGE = "/experiences/og.webp";
export const LOGO_PATH = "/logo/primary.png";
/** Dark mark for browser tab / search favicons (readable on light chrome). */
export const FAVICON_LOGO_PATH = "/logo/favicon.png";

/** Estate coordinates (Sinharaja buffer zone) — matches LocationSection map. */
export const ESTATE_GEO = {
  latitude: 6.383,
  longitude: 80.403,
} as const;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: readonly string[];
  type?: "website" | "article";
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
};

export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  keywords = SITE_KEYWORDS,
  type = "website",
  absoluteTitle = false,
  robots,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImages = [{ url: image, alt: title }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...keywords],
    alternates: { canonical: path === "/" ? "/" : path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_LK",
      type,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    ...(robots ? { robots } : {}),
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const SITE_DESCRIPTION =
  "Thambalagama Estate — a private rainforest bungalow on the edge of Sinharaja Forest Sri Lanka. Base yourself for Sri Lanka rainforest travel, tourism, and holidays.";

export function buildSiteJsonLd(): Record<string, unknown>[] {
  const base = siteUrl();
  const orgId = `${base}/#organization`;
  const websiteId = `${base}/#website`;
  const lodgingId = `${base}/#lodging`;
  const logoUrl = absoluteUrl(LOGO_PATH);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": orgId,
      name: SITE_NAME,
      url: base,
      email: "info@thambalagamaestate.com",
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
      description: SITE_DESCRIPTION,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sinharaja",
        addressRegion: "Sabaragamuwa",
        addressCountry: "LK",
      },
      areaServed: [
        { "@type": "Place", name: "Sinharaja Forest Sri Lanka" },
        { "@type": "Country", name: "Sri Lanka" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      url: base,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": orgId },
      inLanguage: "en-LK",
    },
    {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "@id": lodgingId,
      name: SITE_NAME,
      url: base,
      email: "info@thambalagamaestate.com",
      description: SITE_DESCRIPTION,
      image: absoluteUrl(DEFAULT_OG_IMAGE),
      logo: logoUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sinharaja",
        addressRegion: "Sabaragamuwa",
        addressCountry: "LK",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: ESTATE_GEO.latitude,
        longitude: ESTATE_GEO.longitude,
      },
      parentOrganization: { "@id": orgId },
    },
  ];
}

export { SITE_DESCRIPTION };
