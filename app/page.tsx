import { Header } from "./components/Header";
import { AboutSection } from "./homepagesections/About Section";
import { HeroSection } from "./homepagesections/Hero Section";
import { HomeBelowFold } from "./homepagesections/HomeBelowFold";
import { buildPageMetadata, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sinharaja Forest Stay for Sri Lanka Holidays",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Header audioSrc="/audio/emycutiepants-jungle-ambience-339096.mp3" />
      <HeroSection />
      <AboutSection />
      <HomeBelowFold />
    </main>
  );
}
