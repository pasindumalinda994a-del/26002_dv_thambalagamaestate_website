import Link from "next/link";

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
    { label: "Arriving", value: arriving },
    { label: "In house", value: inHouse },
    { label: "Departing", value: departing },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="border border-forest-green/15 bg-white px-4 py-4 text-forest-green"
        >
          <p className="font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
            {item.label}
          </p>
          <p className="mt-2 font-secondary text-[28px] font-semibold leading-none">
            {item.value}
          </p>
        </div>
      ))}
      <Link
        href="/admin?status=new"
        className="border border-forest-green/15 bg-white px-4 py-4 text-forest-green transition-colors hover:border-forest-green/35"
      >
        <p className="font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
          New
        </p>
        <p className="mt-2 font-secondary text-[28px] font-semibold leading-none">
          {newCount}
        </p>
      </Link>
    </div>
  );
}
