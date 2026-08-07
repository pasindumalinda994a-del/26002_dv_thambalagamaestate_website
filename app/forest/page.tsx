import { JsonLd } from "../components/JsonLd";
import { Header } from "../components/Header";
import { FooterSection } from "../homepagesections/Footer Section";
import { FOREST_HERO, FOREST_SECTIONS } from "./content";
import { ForestGuide } from "./forestsections/ForestGuide";
import { ForestHero } from "./forestsections/ForestHero";
import {
  FOREST_OG_IMAGE,
  LOGO_PATH,
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
  siteUrl,
} from "@/lib/seo";

const FOREST_META_TITLE =
  "Sinharaja Forest Sri Lanka Guide — Entrances, Wildlife & Hiking | Thambalagama Estate";

const FOREST_META_DESCRIPTION =
  "Complete guide to Sinharaja Forest Sri Lanka: entrances, wildlife, hiking, and where to stay. Plan Sri Lanka rainforest travel, tourism, and holidays near the primary rainforest.";

const faqSection = FOREST_SECTIONS.find((section) => section.id === "faq");
const faqBlock = faqSection?.blocks.find(
  (block): block is Extract<(typeof faqSection.blocks)[number], { type: "faq" }> =>
    block.type === "faq",
);
const FOREST_FAQ_ITEMS = faqBlock?.items ?? [];

function buildForestJsonLd(): Record<string, unknown>[] {
  const base = siteUrl();
  const pageUrl = absoluteUrl("/forest");
  const orgId = `${base}/#organization`;
  const imageUrl = absoluteUrl(FOREST_OG_IMAGE);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: FOREST_HERO.headline,
      description: FOREST_META_DESCRIPTION,
      image: [imageUrl],
      datePublished: "2026-01-01",
      dateModified: "2026-01-01",
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: base,
      },
      publisher: {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(LOGO_PATH),
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
      inLanguage: "en-LK",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FOREST_FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sinharaja Forest Guide",
          item: pageUrl,
        },
      ],
    },
  ];
}

export const metadata = buildPageMetadata({
  title: FOREST_META_TITLE,
  description: FOREST_META_DESCRIPTION,
  path: "/forest",
  image: FOREST_OG_IMAGE,
  type: "article",
  absoluteTitle: true,
});

export default function ForestPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-cream">
      <JsonLd data={buildForestJsonLd()} />
      <Header />
      <div className="flex flex-col gap-[72px] pt-24 pb-16 md:pt-28 md:pb-24 lg:pb-32">
        <ForestHero />
        <ForestGuide />
      </div>
      <FooterSection />
    </main>
  );
}
