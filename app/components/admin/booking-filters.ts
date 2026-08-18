import type { Booking, BookingStatus } from "@/lib/bookings/types";
import { addDaysISO, dateToISO } from "./booking-ops";

export const PERIOD_KEYS = [
  "all",
  "today",
  "week",
  "month",
  "upcoming",
  "past",
] as const;

export type PeriodKey = (typeof PERIOD_KEYS)[number];

export function resolvePeriod(value: string | undefined): PeriodKey {
  if (value && (PERIOD_KEYS as readonly string[]).includes(value)) {
    return value as PeriodKey;
  }
  return "all";
}

export function stayOverlapsDay(booking: Booking, day: string) {
  return booking.checkIn <= day && booking.checkOut >= day;
}

export function submittedOn(booking: Booking, day: string) {
  return dateToISO(new Date(booking.createdAt)) === day;
}

export function matchesPeriod(
  booking: Booking,
  period: PeriodKey,
  today: string,
): boolean {
  if (period === "all") return true;

  const submitted = dateToISO(new Date(booking.createdAt));
  const month = today.slice(0, 7);

  switch (period) {
    case "today":
      return submitted === today || stayOverlapsDay(booking, today);
    case "week": {
      const submittedFrom = addDaysISO(today, -6);
      const checkInUntil = addDaysISO(today, 7);
      return (
        (submitted >= submittedFrom && submitted <= today) ||
        (booking.checkIn >= today && booking.checkIn <= checkInUntil)
      );
    }
    case "month":
      return submitted.startsWith(month) || booking.checkIn.startsWith(month);
    case "upcoming":
      return booking.checkIn > today;
    case "past":
      return booking.checkOut < today;
  }
}

export function filterByPeriod(
  bookings: Booking[],
  period: PeriodKey,
  today: string,
) {
  if (period === "all") return bookings;
  return bookings.filter((booking) => matchesPeriod(booking, period, today));
}

export function emptyMessageForList(
  status: BookingStatus,
  period: PeriodKey,
) {
  const noun =
    status === "confirmed"
      ? "confirmed stays"
      : status === "new"
        ? "new requests"
        : status === "contacted"
          ? "contacted requests"
          : "declined requests";

  switch (period) {
    case "today":
      return `No ${noun} today.`;
    case "week":
      return `No ${noun} this week.`;
    case "month":
      return `No ${noun} this month.`;
    case "upcoming":
      return `No upcoming ${noun}.`;
    case "past":
      return `No past ${noun}.`;
    default:
      return `No ${noun}.`;
  }
}
