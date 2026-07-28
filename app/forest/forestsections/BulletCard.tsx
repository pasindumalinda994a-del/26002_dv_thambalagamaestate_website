export function BulletCard({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-start gap-2 border border-[#CFCBB1] p-2 min-w-[240px]">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center">
        <TickIcon />
      </span>
      <p className="font-secondary text-lg font-medium leading-[150%] tracking-[0.2px] text-forest-green md:text-xl">
        {text}
      </p>
    </div>
  );
}

export function BulletCardGrid({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <BulletCard key={item} text={item} />
      ))}
    </div>
  );
}

function TickIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="9" fill="#DDA15E" />
      <path
        d="M5 9.2L7.6 11.8L13 6.4"
        stroke="#FEFAE0"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
