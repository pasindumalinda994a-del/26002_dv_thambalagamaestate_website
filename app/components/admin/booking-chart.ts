import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings/types";
import { addDaysISO, dateToISO } from "./booking-ops";

export const CHART_DAYS = 30;

export type ChartDayBucket = {
  date: string;
  new: number;
  contacted: number;
  confirmed: number;
  declined: number;
  total: number;
};

function emptyBucket(date: string): ChartDayBucket {
  return {
    date,
    new: 0,
    contacted: 0,
    confirmed: 0,
    declined: 0,
    total: 0,
  };
}

export function buildActivitySeries(
  bookings: Booking[],
  today: string,
  days = CHART_DAYS,
): ChartDayBucket[] {
  const start = addDaysISO(today, -(days - 1));
  const buckets = new Map<string, ChartDayBucket>();

  for (let i = 0; i < days; i += 1) {
    const date = addDaysISO(start, i);
    buckets.set(date, emptyBucket(date));
  }

  for (const booking of bookings) {
    const created = dateToISO(new Date(booking.createdAt));
    const bucket = buckets.get(created);
    if (!bucket) continue;
    bucket[booking.status] += 1;
    bucket.total += 1;
  }

  return [...buckets.values()];
}

export const CHART_STACK: BookingStatus[] = [...BOOKING_STATUSES];
