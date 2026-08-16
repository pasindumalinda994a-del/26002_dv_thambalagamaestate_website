import { Header } from "../components/Header";
import { CTASection } from "../homepagesections/CTASection";
import { FooterSection } from "../homepagesections/Footer Section";
import { EXPERIENCES_OG_IMAGE, buildPageMetadata } from "@/lib/seo";
import {
  EXPERIENCES_DINING,
  EXPERIENCES_TRAILS,
} from "./content";
import { CuratedWilderness } from "./experiencesections/CuratedWilderness";
import { ExperienceBlock } from "./experiencesections/ExperienceBlock";
import { ExperiencesHero } from "./experiencesections/ExperiencesHero";
import { WaterfallSection } from "./experiencesections/WaterfallSection";

export const metadata = buildPageMetadata({
  title: "Estate Experiences near Sinharaja Forest",
  description:
    "Curated wilderness experiences at Thambalagama Estate — guided trails, forest bathing by private waterfalls, and bespoke private-chef dining on the edge of Sinharaja Forest Sri Lanka.",
  path: "/experiences",
  image: EXPERIENCES_OG_IMAGE,
});

export default function ExperiencesPage() {
  return (
    <main className="flex min-h-full min-w-0 flex-1 flex-col overflow-x-hidden bg-cream">
      <Header />
      <ExperiencesHero />
      <CuratedWilderness />
      <div className="flex min-w-0 flex-col gap-[93px] py-16 md:gap-28 md:py-24 lg:gap-32 lg:py-28">
        <ExperienceBlock
          ariaLabel="Guided trails through the estate"
          headline={EXPERIENCES_TRAILS.headline}
          body={EXPERIENCES_TRAILS.body}
          mosaic={EXPERIENCES_TRAILS.mosaic}
          features={EXPERIENCES_TRAILS.features}
        />
        <WaterfallSection />
        <ExperienceBlock
          ariaLabel="Bespoke dining prepared by a private chef"
          headline={EXPERIENCES_DINING.headline}
          body={EXPERIENCES_DINING.body}
          mosaic={EXPERIENCES_DINING.mosaic}
          features={EXPERIENCES_DINING.features}
        />
      </div>
      <div className="bg-deep-forest">
        <CTASection />
        <FooterSection />
      </div>
    </main>
  );
}
