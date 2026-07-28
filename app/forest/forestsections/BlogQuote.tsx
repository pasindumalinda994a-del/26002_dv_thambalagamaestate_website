export function BlogQuote({ text }: { text: string }) {
  return (
    <blockquote className="border-l-[6px] border-tan px-4 py-2">
      <p className="font-space-grotesk text-lg font-bold uppercase leading-[130%] tracking-[0.1px] text-forest-green md:text-xl">
        {text}
      </p>
    </blockquote>
  );
}
