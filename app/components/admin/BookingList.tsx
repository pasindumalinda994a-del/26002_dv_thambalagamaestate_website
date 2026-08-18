"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Booking, BookingStatus } from "@/lib/bookings/types";
import { BookingCardList } from "./BookingCardList";
import { BookingTable } from "./BookingTable";
import type { PeriodKey } from "./booking-filters";
import { PERIOD_ITEMS, statusPeriodHref } from "./constants";

function matchesQuery(booking: Booking, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, "");
  return (
    booking.fullName.toLowerCase().includes(q) ||
    booking.email.toLowerCase().includes(q) ||
    (digits.length > 0 && booking.whatsapp.replace(/\D/g, "").includes(digits))
  );
}

export function BookingList({
  bookings,
  today,
  emptyMessage = "No booking requests yet.",
  searchable = false,
  filters,
}: {
  bookings: Booking[];
  today: string;
  emptyMessage?: string;
  searchable?: boolean;
  filters?: { status: BookingStatus; period: PeriodKey };
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => bookings.filter((booking) => matchesQuery(booking, query)),
    [bookings, query],
  );

  const noSearchMatches =
    searchable && bookings.length > 0 && visible.length === 0;
  const listEmptyMessage = noSearchMatches
    ? "No guests match that search."
    : emptyMessage;

  return (
    <div>
      {filters ? (
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="navigation"
          aria-label="Filter by period"
        >
          {PERIOD_ITEMS.map((item) => {
            const isActive = filters.period === item.value;
            return (
              <Link
                key={item.value}
                href={statusPeriodHref(filters.status, item.value)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "px-3 py-1.5 font-secondary text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-forest-green text-cream"
                    : "border border-forest-green/20 text-forest-green hover:border-forest-green/45",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {searchable && bookings.length > 0 ? (
        <label className="mb-4 block">
          <span className="sr-only">Search bookings</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or WhatsApp"
            className="w-full border border-forest-green/20 bg-white px-4 py-3 font-secondary text-[14px] text-forest-green outline-none placeholder:text-forest-green/40 focus:border-forest-green/50"
          />
        </label>
      ) : null}

      <div className="md:hidden">
        <BookingCardList
          bookings={visible}
          today={today}
          emptyMessage={listEmptyMessage}
        />
      </div>
      <div className="hidden md:block">
        <BookingTable
          bookings={visible}
          today={today}
          emptyMessage={listEmptyMessage}
        />
      </div>
    </div>
  );
}
