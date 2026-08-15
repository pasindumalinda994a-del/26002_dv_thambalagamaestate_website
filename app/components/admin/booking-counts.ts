import type { Booking, BookingStatus } from "@/lib/bookings/types";
import {
  partitionForDashboard,
  todayBoardCount,
  todayISO,
} from "./booking-ops";

export type AdminNavKey = BookingStatus | "all" | "today";

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

export function countForAdmin(
  bookings: Booking[],
  today = todayISO(),
): AdminCounts {
  const status = countByStatus(bookings);
  const partition = partitionForDashboard(bookings, today);
  return {
    ...status,
    today: todayBoardCount(partition),
  };
}

export const EMPTY_COUNTS: AdminCounts = {
  all: 0,
  new: 0,
  contacted: 0,
  confirmed: 0,
  declined: 0,
  today: 0,
};

export function emptyMessageForStatus(status: BookingStatus | "all") {
  switch (status) {
    case "new":
      return "No new requests.";
    case "contacted":
      return "No contacted requests.";
    case "confirmed":
      return "No confirmed stays.";
    case "declined":
      return "No declined requests.";
    default:
      return "No booking requests yet.";
  }
}
