export function OpsStats({
  arriving,
  inHouse,
  departing,
  newCount,
}: {
  arriving: number;
  inHouse: number;
  departing: number;
  newCount: number;
}) {
  const items = [
    { href: "#arriving", label: "Arriving", value: arriving },
    { href: "#in-house", label: "In house", value: inHouse },
    { href: "#departing", label: "Departing", value: departing },
    { href: "#needs-reply", label: "New", value: newCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="border border-forest-green/15 bg-white px-4 py-4 text-forest-green transition-colors hover:border-forest-green/35"
        >
          <p className="font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
            {item.label}
          </p>
          <p className="mt-2 font-secondary text-[28px] font-semibold leading-none">
            {item.value}
          </p>
        </a>
      ))}
    </div>
  );
}
