type NumberCardProps = {
  number: string;
  sub: string;
  text: string;
};

export function NumberCard({ number, sub, text }: NumberCardProps) {
  return (
    <div className="flex gap-8 border-b border-[#CFCBB1] px-2 pb-8 pt-2 md:px-4">
      <div className="flex w-10 shrink-0 flex-col items-stretch">
        <span className="font-space-grotesk text-[32px] font-bold uppercase leading-none tracking-[0.2px] text-tan">
          {number}
        </span>
        <span className="font-space-grotesk text-[10px] font-bold uppercase leading-[150%] tracking-[0.2px] text-olive">
          {sub}
        </span>
      </div>
      <p className="font-secondary text-lg font-medium leading-[150%] tracking-[0.2px] text-forest-green md:text-xl">
        {text}
      </p>
    </div>
  );
}

export function NumberCardList({
  cards,
}: {
  cards: { number: string; sub: string; text: string }[];
}) {
  return (
    <div className="flex flex-col">
      {cards.map((card) => (
        <NumberCard
          key={card.number}
          number={card.number}
          sub={card.sub}
          text={card.text}
        />
      ))}
    </div>
  );
}
