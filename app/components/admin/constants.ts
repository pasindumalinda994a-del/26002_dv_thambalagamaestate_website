import {
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings/types";

export const STATUS_LABELS: Record<BookingStatus | "all", string> = {
  all: "All",
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  declined: "Declined",
};

export const NAV_ITEMS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: STATUS_LABELS.all },
  ...BOOKING_STATUSES.map((value) => ({
    value,
    label: STATUS_LABELS[value],
  })),
];
