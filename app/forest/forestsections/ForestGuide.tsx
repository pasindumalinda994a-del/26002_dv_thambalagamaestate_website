import Image from "next/image";
import { Button } from "../../components/SolidButton";
import {
  FOREST_SECTIONS,
  FOREST_TOC,
  type ContentBlock,
} from "../content";
import { BlogQuote } from "./BlogQuote";
import { BulletCardGrid } from "./BulletCard";
import { ContentBox } from "./ContentBox";
import { EntranceTable } from "./EntranceTable";
import { FaqAccordion } from "./FaqAccordion";
import { ForestToc } from "./ForestToc";
import { NumberCardList } from "./NumberCard";
import { RichParagraph } from "./RichParagraph";
import { TitleCardGrid } from "./TitleCard";

export function ForestGuide() {
  return (
    <div className="flex flex-col gap-10 px-5 md:px-8 lg:flex-row lg:gap-5">
      <div className="w-full shrink-0 lg:w-[329px]">
        <ForestToc items={FOREST_TOC} />
      </div>

      <div className="flex w-full max-w-[852px] flex-col gap-14">
        {FOREST_SECTIONS.map((section) => (
          <ContentBox key={section.id} id={section.id} title={section.title}>
            {section.blocks.map((block, index) => (
              <BlockRenderer
                key={`${section.id}-${block.type}-${index}`}
                block={block}
              />
            ))}
          </ContentBox>
        ))}
      </div>
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <RichParagraph text={block.text} />;
    case "quote":
      return <BlogQuote text={block.text} />;
    case "image":
      return <GuideImage src={block.src} alt={block.alt} />;
    case "titleCards":
      return <TitleCardGrid cards={block.cards} />;
    case "table":
      return <EntranceTable headers={block.headers} rows={block.rows} />;
    case "bullets":
      return <BulletCardGrid items={block.items} />;
    case "numberCards":
      return <NumberCardList cards={block.cards} />;
    case "button":
      return (
        <div>
          <Button href={block.href} variant="onCream">
            {block.label}
          </Button>
        </div>
      );
    case "faq":
      return <FaqAccordion items={block.items} />;
    default:
      return null;
  }
}

function GuideImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[853/486] w-full overflow-hidden bg-[#B3B3B3]">
      <Image src={src} alt={alt} fill sizes="(max-width: 852px) 100vw, 852px" className="object-cover" />
    </div>
  );
}
