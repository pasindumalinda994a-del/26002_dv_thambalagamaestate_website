import { H2 } from "../../components/H2";
import { Paragraph } from "../../components/Paragraph";
import type { ExperiencesImage } from "../content";
import { FeatureLabelRow } from "./FeatureLabelRow";
import { ImageMosaic } from "./ImageMosaic";

type ExperienceBlockProps = {
  ariaLabel: string;
  headline: string;
  body: string;
  mosaic: readonly ExperiencesImage[];
  features: readonly string[];
  className?: string;
};

export function ExperienceBlock({
  ariaLabel,
  headline,
  body,
  mosaic,
  features,
  className,
}: ExperienceBlockProps) {
  const large = mosaic[0]!;
  const top = mosaic[1]!;
  const bottom = mosaic[2]!;

  return (
    <section
      aria-label={ariaLabel}
      className={[
        "flex min-w-0 flex-col gap-8 px-4 md:gap-12 md:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-3 md:gap-6">
        <H2 className="w-full max-w-full break-words uppercase text-deep-forest !text-[clamp(24px,3.75vw,54px)]">
          {headline}
        </H2>
        <Paragraph className="w-full max-w-full text-forest-green leading-[150%] tracking-[0.2px]">
          {body}
        </Paragraph>
      </div>

      <div className="flex min-w-0 flex-col gap-6 md:gap-10">
        <ImageMosaic large={large} top={top} bottom={bottom} />
        <FeatureLabelRow labels={features} />
      </div>
    </section>
  );
}
