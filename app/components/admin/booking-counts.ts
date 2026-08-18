import type { Booking, BookingStatus } from "@/lib/bookings/types";

export type AdminNavKey = BookingStatus | "dashboard";

export type AdminCounts = Record<AdminNavKey, number>;

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

export function countForAdmin(bookings: Booking[]): AdminCounts {
  const status = countByStatus(bookings);
  return {
    dashboard: status.new,
    new: status.new,
    contacted: status.contacted,
    confirmed: status.confirmed,
    declined: status.declined,
  };
}

export const EMPTY_COUNTS: AdminCounts = {
  dashboard: 0,
  new: 0,
  contacted: 0,
  confirmed: 0,
  declined: 0,
};
