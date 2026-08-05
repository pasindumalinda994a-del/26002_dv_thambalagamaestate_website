import { Header } from "./components/Header";
import { Preloader } from "./components/Preloader";
import { AboutSection } from "./homepagesections/About Section";
import { ForestExperienceLocationStack } from "./homepagesections/ForestExperienceLocationStack";
import { HeroSection } from "./homepagesections/Hero Section";
import { VillaSection } from "./homepagesections/Villa Section";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Preloader />
      <Header audioSrc="/audio/emycutiepants-jungle-ambience-339096.mp3" />
      <HeroSection />
      <AboutSection />
      <VillaSection />
      <ForestExperienceLocationStack />
    </main>
  );
}
