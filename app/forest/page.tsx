import { AmbientAudioToggle } from "../components/AmbientAudioToggle";
import { Header } from "../components/Header";
import { FooterSection } from "../homepagesections/Footer Section";
import { ForestGuide } from "./forestsections/ForestGuide";
import { ForestHero } from "./forestsections/ForestHero";

export default function ForestPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-cream">
      <Header />
      <div className="flex flex-col gap-[72px] pt-24 pb-16 md:pt-28 md:pb-24 lg:pb-32">
        <ForestHero />
        <ForestGuide />
      </div>
      <FooterSection />
      <AmbientAudioToggle />
    </main>
  );
}
