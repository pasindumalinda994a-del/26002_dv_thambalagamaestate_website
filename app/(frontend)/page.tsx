import { Header } from "@/app/components/Header";
import { AboutSection } from "@/app/homepagesections/About Section";
import { HeroSection } from "@/app/homepagesections/Hero Section";
import { HomeBelowFold } from "@/app/homepagesections/HomeBelowFold";
import { buildPageMetadata, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sinharaja Forest Stay for Sri Lanka Holidays",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Header />
      <HeroSection />
      <AboutSection />
      <HomeBelowFold />
    </main>
  );
}
