"use client";

import { useListQuery } from "@payloadcms/ui";
import { useMemo } from "react";
import type { BookingStatus } from "@/lib/bookings/types";
import { BOOKING_STATUSES } from "@/lib/bookings/types";
import { STATUS_LABELS } from "./status-styles";

type FilterKey = "all" | BookingStatus;

function activeStatus(where: unknown): FilterKey {
  if (!where || typeof where !== "object") return "all";
  const status = (where as { status?: { equals?: unknown } }).status;
  const value = status?.equals;
  if (
    typeof value === "string" &&
    (BOOKING_STATUSES as readonly string[]).includes(value)
  ) {
    return value as BookingStatus;
  }
  return "all";
}

export function InquiryQuickFilters() {
  const { query, handleWhereChange, refineListData } = useListQuery();
  const current = useMemo(() => activeStatus(query?.where), [query?.where]);

  const setFilter = async (key: FilterKey) => {
    if (key === "all") {
      if (handleWhereChange) {
        await handleWhereChange({});
      } else {
        await refineListData({ where: {} });
      }
      return;
    }

    const where = { status: { equals: key } };
    if (handleWhereChange) {
      await handleWhereChange(where);
    } else {
      await refineListData({ where });
    }
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    ...BOOKING_STATUSES.map((status) => ({
      key: status as FilterKey,
      label: STATUS_LABELS[status],
    })),
  ];

  return (
    <div className="te-filters" aria-label="Filter inquiries by status">
      <div className="te-filters__label">Find by status</div>
      <div className="te-filters__pills" role="group">
        {filters.map((filter) => {
          const active = current === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              className={`te-filter-pill${active ? " te-filter-pill--active" : ""}${
                filter.key !== "all" ? ` te-filter-pill--${filter.key}` : ""
              }`}
              aria-pressed={active}
              onClick={() => void setFilter(filter.key)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
