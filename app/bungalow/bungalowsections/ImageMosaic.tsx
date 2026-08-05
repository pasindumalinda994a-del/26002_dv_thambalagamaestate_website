import Image from "next/image";
import type { BungalowImage } from "../content";

type ImageMosaicProps = {
  large: BungalowImage;
  top: BungalowImage;
  bottom: BungalowImage;
};

export function ImageMosaic({ large, top, bottom }: ImageMosaicProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-5">
      <div className="relative aspect-[16/11] overflow-hidden bg-[#D9D9D9] md:aspect-auto md:min-h-[420px] lg:aspect-[853/764] lg:min-h-[764px]">
        <Image
          src={large.src}
          alt={large.alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-5">
        <div className="relative aspect-square overflow-hidden bg-[#D9D9D9] md:aspect-[501/372]">
          <Image
            src={top.src}
            alt={top.alt}
            fill
            sizes="(max-width: 768px) 45vw, 35vw"
            className="object-cover"
          />
        </div>
        <div className="relative aspect-square overflow-hidden bg-[#D9D9D9] md:aspect-[501/372]">
          <Image
            src={bottom.src}
            alt={bottom.alt}
            fill
            sizes="(max-width: 768px) 45vw, 35vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
