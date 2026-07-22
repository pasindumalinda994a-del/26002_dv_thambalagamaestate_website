import type { Booking, BookingStatus } from "@/lib/bookings/types";

export function countByStatus(bookings: Booking[]) {
  const counts: Record<BookingStatus | "all", number> = {
    all: bookings.length,
    new: 0,
    contacted: 0,
    confirmed: 0,
    declined: 0,
  };
  for (const booking of bookings) {
    counts[booking.status] += 1;
  }
  return counts;
}

export const EMPTY_COUNTS: Record<BookingStatus | "all", number> = {
  all: 0,
  new: 0,
  contacted: 0,
  confirmed: 0,
  declined: 0,
};
