import Link from "next/link";
import type { Booking } from "@/lib/bookings/types";
import { Button } from "../Button";
import { BookingQuickActions } from "./BookingQuickActions";
import { formatDate, nightCount } from "./format";
import { StayBadge } from "./StayBadge";
import { stayPhase } from "./booking-ops";
import { StatusSelect } from "./StatusSelect";

export function BookingOpsCard({
  booking,
  today,
  showBadge = false,
}: {
  booking: Booking;
  today: string;
  showBadge?: boolean;
}) {
  const nights = nightCount(booking.checkIn, booking.checkOut);
  const phase = stayPhase(booking, today);
  const guests = booking.adults + booking.children;

  return (
    <article className="border border-forest-green/15 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showBadge ? (
            <div className="mb-2">
              <StayBadge phase={phase} />
            </div>
          ) : null}
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
        <Button
          href={`/admin/bookings/${booking.id}`}
          variant="dark"
          size="small"
          showArrow={false}
          className="shrink-0"
        >
          View
        </Button>
      </div>

      <p className="mt-3 font-secondary text-[13px] text-forest-green">
        {guests} {guests === 1 ? "guest" : "guests"}
        <span className="ml-1 text-[11px] text-forest-green/50">
          ({booking.adults}A / {booking.children}C)
        </span>
        {booking.purpose ? (
          <span className="ml-3 capitalize text-forest-green/70">
            {booking.purpose}
          </span>
        ) : null}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:min-w-[140px]">
          <p className="mb-1.5 font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
            Status
          </p>
          <StatusSelect
            bookingId={booking.id}
            initialStatus={booking.status}
          />
        </div>
        <BookingQuickActions booking={booking} className="sm:justify-end" />
      </div>
    </article>
  );
}
