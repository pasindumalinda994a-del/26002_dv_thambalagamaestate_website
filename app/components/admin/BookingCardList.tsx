import Link from "next/link";
import type { Booking } from "@/lib/bookings/types";
import { formatDate, formatSubmitted, nightCount } from "./format";
import { StatusSelect } from "./StatusSelect";

export function BookingCardList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="border border-forest-green/15 bg-white px-6 py-10 text-center font-secondary text-sm text-forest-green/60">
        No booking requests yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {bookings.map((booking) => {
        const nights = nightCount(booking.checkIn, booking.checkOut);
        return (
          <li
            key={booking.id}
            className="border border-forest-green/15 bg-white"
          >
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-secondary text-[16px] font-semibold text-forest-green underline-offset-2 hover:underline"
                  >
                    {booking.fullName}
                  </Link>
                  <p className="mt-1 font-secondary text-[13px] text-forest-green/70">
                    {formatDate(booking.checkIn)}
                    <span className="text-forest-green/40"> – </span>
                    {formatDate(booking.checkOut)}
                    <span className="ml-1 text-forest-green/50">
                      · {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="shrink-0 border border-forest-green/25 px-3 py-1.5 font-secondary text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-green transition-colors hover:bg-forest-green hover:text-cream"
                >
                  View
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 font-secondary text-[13px] text-forest-green">
                <span>
                  {booking.adults + booking.children} guests
                  <span className="ml-1 text-[11px] text-forest-green/50">
                    ({booking.adults}A / {booking.children}C)
                  </span>
                </span>
                <span className="capitalize text-forest-green/70">
                  {booking.purpose || "No purpose"}
                </span>
              </div>

              <div>
                <p className="mb-2 font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
                  Status
                </p>
                <StatusSelect
                  bookingId={booking.id}
                  initialStatus={booking.status}
                />
              </div>

              <p className="font-secondary text-[12px] text-forest-green/50">
                Submitted {formatSubmitted(booking.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
