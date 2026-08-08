import Link from "next/link";
import type { Booking } from "@/lib/bookings/types";
import { Button } from "../Button";
import { formatDate, formatSubmitted } from "./format";
import { StatusSelect } from "./StatusSelect";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="border border-forest-green/15 bg-white px-6 py-10 text-center font-secondary text-sm text-forest-green/60">
        No booking requests yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-forest-green/15 bg-white">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-forest-green/15 bg-cream/60">
            {[
              "Guest",
              "Dates",
              "Guests",
              "Purpose",
              "Status",
              "Submitted",
              "",
            ].map((label, index) => (
              <th
                key={label || `actions-${index}`}
                className="px-4 py-3 font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/55"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b border-forest-green/10 align-middle last:border-b-0 hover:bg-cream/40"
            >
              <td className="px-4 py-3.5">
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="font-secondary text-[13px] font-semibold text-forest-green underline-offset-2 hover:underline"
                >
                  {booking.fullName}
                </Link>
              </td>
              <td className="px-4 py-3.5 font-secondary text-[13px] text-forest-green whitespace-nowrap">
                {formatDate(booking.checkIn)}
                <span className="text-forest-green/40"> – </span>
                {formatDate(booking.checkOut)}
              </td>
              <td className="px-4 py-3.5 font-secondary text-[13px] text-forest-green whitespace-nowrap">
                {booking.adults + booking.children}
                <span className="ml-1 text-[11px] text-forest-green/50">
                  ({booking.adults}A / {booking.children}C)
                </span>
              </td>
              <td className="px-4 py-3.5 font-secondary text-[13px] capitalize text-forest-green">
                {booking.purpose || "—"}
              </td>
              <td className="px-4 py-3.5">
                <StatusSelect
                  bookingId={booking.id}
                  initialStatus={booking.status}
                />
              </td>
              <td className="px-4 py-3.5 font-secondary text-[12px] text-forest-green/70 whitespace-nowrap">
                {formatSubmitted(booking.createdAt)}
              </td>
              <td className="px-4 py-3.5 text-right">
                <Button
                  href={`/admin/bookings/${booking.id}`}
                  variant="dark"
                  size="small"
                  showArrow={false}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
