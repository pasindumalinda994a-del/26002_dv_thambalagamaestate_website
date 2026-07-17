"use client";

import { useState, useTransition } from "react";
import { updateBookingStatusAction } from "@/app/actions/bookings";
import {
  BOOKING_STATUSES,
  type BookingStatus,
} from "@/lib/bookings/types";
import { STATUS_LABELS } from "./constants";

const STATUS_BORDER: Record<BookingStatus, string> = {
  new: "border-l-olive",
  contacted: "border-l-tan",
  confirmed: "border-l-forest-green",
  declined: "border-l-chestnut",
};

export function StatusSelect({
  bookingId,
  initialStatus,
}: {
  bookingId: string;
  initialStatus: BookingStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as BookingStatus;
          const prev = status;
          setStatus(next);
          setError(null);
          startTransition(async () => {
            const result = await updateBookingStatusAction({
              id: bookingId,
              status: next,
            });
            if (!result.ok) {
              setStatus(prev);
              setError(result.error);
            }
          });
        }}
        className={[
          "w-full border border-forest-green/25 border-l-4 bg-white px-3 py-3 font-secondary text-[14px] text-forest-green outline-none focus:border-forest-green/50 disabled:opacity-60 md:min-h-0 md:w-auto md:px-2 md:py-1.5 md:text-[12px]",
          STATUS_BORDER[status],
        ].join(" ")}
        aria-label="Booking status"
      >
        {BOOKING_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      {error ? (
        <span className="font-secondary text-[11px] text-chestnut">{error}</span>
      ) : null}
    </div>
  );
}
