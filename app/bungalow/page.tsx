import { Header } from "../components/Header";
import { FooterSection } from "../homepagesections/Footer Section";
import { BungalowCta } from "./bungalowsections/BungalowCta";
import { BungalowHero } from "./bungalowsections/BungalowHero";
import { ComfortSection } from "./bungalowsections/ComfortSection";
import { PoolSection } from "./bungalowsections/PoolSection";
import { PrivateQuartersSection } from "./bungalowsections/PrivateQuartersSection";
import { SpecsSection } from "./bungalowsections/SpecsSection";

export default function BungalowPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-cream">
      <Header />
      <BungalowHero />
      <div className="flex flex-col gap-20 py-20 md:gap-24 md:py-24 lg:gap-32 lg:py-32">
        <ComfortSection />
        <SpecsSection />
      </div>
      <PoolSection />
      <PrivateQuartersSection />
      <BungalowCta />
      <FooterSection />
    </main>
  );
}
