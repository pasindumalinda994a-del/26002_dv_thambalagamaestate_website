import {
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings/types";
import type { AdminNavKey } from "./booking-counts";

export const STATUS_LABELS: Record<BookingStatus | "all", string> = {
  all: "All",
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  declined: "Declined",
};

export const NAV_LABELS: Record<AdminNavKey, string> = {
  today: "Today",
  ...STATUS_LABELS,
};

export const NAV_ITEMS: { value: AdminNavKey; label: string }[] = [
  { value: "today", label: NAV_LABELS.today },
  { value: "all", label: NAV_LABELS.all },
  ...BOOKING_STATUSES.map((value) => ({
    value,
    label: NAV_LABELS[value],
  })),
];

export function navHref(value: AdminNavKey) {
  if (value === "today") return "/admin";
  if (value === "all") return "/admin?status=all";
  return `/admin?status=${value}`;
}
