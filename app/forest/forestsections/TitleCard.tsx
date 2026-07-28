type TitleCardProps = {
  title: string;
  content: string;
};

export function TitleCard({ title, content }: TitleCardProps) {
  return (
    <div className="flex min-w-[240px] flex-1 flex-col gap-2 border-t border-[#CFCBB1] px-2 py-4">
      <p className="font-space-grotesk text-base font-bold uppercase leading-[150%] tracking-[0.2px] text-chestnut">
        {title}
      </p>
      <p className="font-secondary text-base font-medium leading-[150%] tracking-[0.2px] text-forest-green">
        {content}
      </p>
    </div>
  );
}

export function TitleCardGrid({
  cards,
}: {
  cards: { title: string; content: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {cards.map((card) => (
        <TitleCard key={card.title} title={card.title} content={card.content} />
      ))}
    </div>
  );
}
