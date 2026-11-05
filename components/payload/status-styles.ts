import type { BookingStatus } from "@/lib/bookings/types";
import { BOOKING_STATUSES } from "@/lib/bookings/types";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  declined: "Declined",
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    typeof value === "string" &&
    (BOOKING_STATUSES as readonly string[]).includes(value)
  );
}

export function statusClassName(status: BookingStatus): string {
  return `te-status te-status--${status}`;
}
