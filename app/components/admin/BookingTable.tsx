import Link from "next/link";
import type { Booking } from "@/lib/bookings/types";
import { Button } from "../Button";
import { BookingQuickActions } from "./BookingQuickActions";
import { stayPhase } from "./booking-ops";
import { formatDate, formatSubmitted, nightCount } from "./format";
import { StayBadge } from "./StayBadge";
import { StatusSelect } from "./StatusSelect";

export function BookingTable({
  bookings,
  today,
  emptyMessage = "No booking requests yet.",
}: {
  bookings: Booking[];
  today: string;
  emptyMessage?: string;
}) {
  if (bookings.length === 0) {
    return (
      <p className="border border-forest-green/15 bg-white px-6 py-10 text-center font-secondary text-sm text-forest-green/60">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-forest-green/15 bg-white">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-forest-green/15 bg-cream/60">
            {[
              "Guest",
              "Stay",
              "Dates",
              "Guests",
              "Status",
              "Contact",
              "",
            ].map((label, index) => (
              <th
                key={label || `actions-${index}`}
                className="px-4 py-3 font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/55"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const nights = nightCount(booking.checkIn, booking.checkOut);
            const phase = stayPhase(booking, today);
            return (
              <tr
                key={booking.id}
                className="border-b border-forest-green/10 align-middle last:border-b-0 hover:bg-cream/40"
              >
                <td className="px-4 py-3.5">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-secondary text-[13px] font-semibold text-forest-green underline-offset-2 hover:underline"
                  >
                    {booking.fullName}
                  </Link>
                  <p className="mt-0.5 font-secondary text-[11px] text-forest-green/45">
                    {formatSubmitted(booking.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <StayBadge phase={phase} />
                </td>
                <td className="px-4 py-3.5 font-secondary text-[13px] text-forest-green whitespace-nowrap">
                  {formatDate(booking.checkIn)}
                  <span className="text-forest-green/40"> – </span>
                  {formatDate(booking.checkOut)}
                  <p className="mt-0.5 text-[11px] text-forest-green/50">
                    {nights} {nights === 1 ? "night" : "nights"}
                    {booking.purpose ? (
                      <span className="ml-1 capitalize">
                        · {booking.purpose}
                      </span>
                    ) : null}
                  </p>
                </td>
                <td className="px-4 py-3.5 font-secondary text-[13px] text-forest-green whitespace-nowrap">
                  {booking.adults + booking.children}
                  <span className="ml-1 text-[11px] text-forest-green/50">
                    ({booking.adults}A / {booking.children}C)
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusSelect
                    bookingId={booking.id}
                    initialStatus={booking.status}
                  />
                </td>
                <td className="px-4 py-3.5">
                  <BookingQuickActions booking={booking} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button
                    href={`/admin/bookings/${booking.id}`}
                    variant="dark"
                    size="small"
                    showArrow={false}
                  >
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
