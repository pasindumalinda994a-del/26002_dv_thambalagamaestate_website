import { H1 } from "./H1";
import { Header } from "./Header";
import { FooterSection } from "../homepagesections/Footer Section";

export function LiveSoonPage({ title }: { title: string }) {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-cream">
      <Header />
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-24 md:px-8 md:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <H1 className="uppercase text-deep-forest">{title}</H1>
          <p className="font-secondary text-sm font-medium uppercase tracking-[0.15em] text-forest-green md:text-[14px]">
            Live soon
          </p>
        </div>
      </div>
      <FooterSection />
    </main>
  );
}
