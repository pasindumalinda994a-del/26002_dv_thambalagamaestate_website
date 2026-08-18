import {
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings/types";
import type { AdminNavKey } from "./booking-counts";
import type { PeriodKey } from "./booking-filters";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  declined: "Declined",
};

export const NAV_LABELS: Record<AdminNavKey, string> = {
  dashboard: "Dashboard",
  ...STATUS_LABELS,
};

export const NAV_ITEMS: { value: AdminNavKey; label: string }[] = [
  { value: "dashboard", label: NAV_LABELS.dashboard },
  ...BOOKING_STATUSES.map((value) => ({
    value,
    label: NAV_LABELS[value],
  })),
];

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  all: "All",
  today: "Today",
  week: "This week",
  month: "This month",
  upcoming: "Upcoming",
  past: "Past",
};

export const PERIOD_ITEMS: { value: PeriodKey; label: string }[] = [
  { value: "all", label: PERIOD_LABELS.all },
  { value: "today", label: PERIOD_LABELS.today },
  { value: "week", label: PERIOD_LABELS.week },
  { value: "month", label: PERIOD_LABELS.month },
  { value: "upcoming", label: PERIOD_LABELS.upcoming },
  { value: "past", label: PERIOD_LABELS.past },
];

export function navHref(value: AdminNavKey) {
  if (value === "dashboard") return "/admin";
  return `/admin?status=${value}`;
}

export function statusPeriodHref(status: BookingStatus, period: PeriodKey) {
  if (period === "all") return `/admin?status=${status}`;
  return `/admin?status=${status}&period=${period}`;
}
