import { Header } from "./components/Header";
import { AboutSection } from "./homepagesections/About Section";
import { HeroSection } from "./homepagesections/Hero Section";
import { StartExperience } from "./homepagesections/Start Experience";
import { VillaSection } from "./homepagesections/Vila Section";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <StartExperience />
      <Header variant="hero" />
      <HeroSection />
      <AboutSection />
      <VillaSection />
    </main>
  );
}
