import { AmbientAudioToggle } from "./components/AmbientAudioToggle";
import { Header } from "./components/Header";
import {
  TempPaletteProvider,
  TempPaletteToggle,
} from "./components/TempPaletteToggle";
import { AboutSection } from "./homepagesections/About Section";
import { ForestExperienceLocationStack } from "./homepagesections/ForestExperienceLocationStack";
import { HeroSection } from "./homepagesections/Hero Section";
// import { StartExperience } from "./homepagesections/Start Experience";
import { VillaSection } from "./homepagesections/Villa Section";

export default function Home() {
  return (
    <TempPaletteProvider>
      <main className="flex min-h-full flex-1 flex-col">
        {/* <StartExperience /> */}
        <Header />
        <HeroSection />
        <AboutSection />
        <VillaSection />
        <ForestExperienceLocationStack />
        <AmbientAudioToggle />
        <TempPaletteToggle />
      </main>
    </TempPaletteProvider>
  );
}
