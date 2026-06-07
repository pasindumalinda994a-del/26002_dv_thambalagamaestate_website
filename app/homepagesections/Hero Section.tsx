import { GlassyButton } from "../components/GlassyButton";
import { H1 } from "../components/H1";
import { Paragraph } from "../components/Paragraph";

const VIDEO_SRC = "/videos/Hero%20Section%20Bg.mp4";

export function HeroSection() {
  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
      />

      <div aria-hidden className="absolute inset-0 bg-black/29" />

      <div className="relative z-10 flex flex-col items-center gap-[clamp(1.5rem,3vw,2.5rem)] px-6 text-center">
        <H1 className="max-w-5xl uppercase text-cream">
          The edge of the
          <br />
          Sinharaja rainforest.
        </H1>

        <Paragraph className="max-w-xl text-cream">
          A fully private 18-guest reserve on the Sinharaja buffer zone. Where
          the rainforest belongs only to you.
        </Paragraph>

        <GlassyButton href="/book">Check Availability</GlassyButton>
      </div>
    </section>
  );
}
