import Link from "next/link";
import {
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings/types";
import { STATUS_LABELS } from "./constants";

export function DashboardStats({
  counts,
  active,
}: {
  counts: Record<BookingStatus | "all", number>;
  active: BookingStatus | "all";
}) {
  const items: { value: BookingStatus | "all"; label: string }[] = [
    { value: "all", label: STATUS_LABELS.all },
    ...BOOKING_STATUSES.map((value) => ({
      value,
      label: STATUS_LABELS[value],
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const isActive = active === item.value;
        const href =
          item.value === "all" ? "/admin" : `/admin?status=${item.value}`;
        return (
          <Link
            key={item.value}
            href={href}
            className={[
              "border px-4 py-4 transition-colors",
              isActive
                ? "border-forest-green bg-forest-green text-cream"
                : "border-forest-green/15 bg-white text-forest-green hover:border-forest-green/35",
            ].join(" ")}
          >
            <p
              className={[
                "font-secondary text-[11px] font-medium uppercase tracking-[0.14em]",
                isActive ? "text-cream/70" : "text-forest-green/50",
              ].join(" ")}
            >
              {item.label}
            </p>
            <p className="mt-2 font-secondary text-[28px] font-semibold leading-none">
              {counts[item.value]}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
