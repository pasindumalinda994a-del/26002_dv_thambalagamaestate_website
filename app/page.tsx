import dynamic from "next/dynamic";
import { AmbientAudioToggle } from "./components/AmbientAudioToggle";
import { Header } from "./components/Header";
import { AboutSection } from "./homepagesections/About Section";
import { HeroSection } from "./homepagesections/Hero Section";

const ForestExperienceLocationStack = dynamic(() =>
  import("./homepagesections/ForestExperienceLocationStack").then(
    (mod) => mod.ForestExperienceLocationStack,
  ),
);
// import { StartExperience } from "./homepagesections/Start Experience";
import { VillaSection } from "./homepagesections/Villa Section";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      {/* <StartExperience /> */}
      <Header variant="hero" />
      <HeroSection />
      <AboutSection />
      <VillaSection />
      <ForestExperienceLocationStack />
      <AmbientAudioToggle />
    </main>
  );
}
