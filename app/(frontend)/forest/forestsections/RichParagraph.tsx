import type { ReactNode } from "react";

/** Renders guide body text with **bold** markers and paragraph breaks. */
export function RichParagraph({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="flex flex-col gap-2">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="font-secondary text-base font-normal leading-[150%] tracking-[0.2px] text-forest-green"
        >
          {renderInline(paragraph)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
