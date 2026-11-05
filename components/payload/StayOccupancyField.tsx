"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConfirmedStay } from "@/lib/bookings/dates";
import {
  expandStayNights,
  nightCount,
  nightsByStay,
} from "@/lib/bookings/dates";
import {
  addMonths,
  fetchConfirmedStays,
  parseMonthFromIso,
} from "./calendar-shared";
import { MonthGrid } from "./MonthGrid";

export function StayOccupancyField() {
  const { id } = useDocumentInfo();
  const checkIn = useFormFields(
    ([fields]) => fields.checkIn?.value as string | undefined,
  );
  const checkOut = useFormFields(
    ([fields]) => fields.checkOut?.value as string | undefined,
  );
  const status = useFormFields(
    ([fields]) => fields.status?.value as string | undefined,
  );

  const [stays, setStays] = useState<ConfirmedStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStays(await fetchConfirmedStays());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load occupancy",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const previewNights = useMemo(() => {
    if (!checkIn || !checkOut) return new Set<string>();
    return new Set(expandStayNights(checkIn, checkOut));
  }, [checkIn, checkOut]);

  const otherStays = useMemo(() => {
    const currentId = id != null ? String(id) : null;
    return stays.filter((s) => !currentId || s.id !== currentId);
  }, [stays, id]);

  const nightMap = useMemo(() => nightsByStay(otherStays), [otherStays]);

  const conflictNights = useMemo(() => {
    const conflicts = new Set<string>();
    for (const night of previewNights) {
      if (nightMap.has(night)) conflicts.add(night);
    }
    return conflicts;
  }, [previewNights, nightMap]);

  const nights = checkIn && checkOut ? nightCount(checkIn, checkOut) : 0;
  const isConfirmed = status === "confirmed";
  const hasConflict = conflictNights.size > 0;
  const cursor = parseMonthFromIso(checkIn);

  let message: string;
  if (!checkIn || !checkOut || nights === 0) {
    message =
      "Enter valid check-in and check-out dates to preview blocked nights.";
  } else if (hasConflict) {
    message = isConfirmed
      ? `Warning: this confirmed stay overlaps ${conflictNights.size} night(s) already held by another confirmed booking.`
      : `Warning: confirming would overlap ${conflictNights.size} night(s) already blocked by another confirmed stay.`;
  } else if (isConfirmed) {
    message = `These ${nights} night${nights === 1 ? "" : "s"} are blocked for website bookings.`;
  } else {
    message = `Confirming will block ${nights} night${nights === 1 ? "" : "s"} on the public calendar.`;
  }

  return (
    <section
      className={`te-cal te-cal--field${hasConflict ? " te-cal--conflict" : ""}`}
      aria-label="Stay occupancy"
    >
      <div className="te-cal__header">
        <div>
          <h3 className="te-cal__title">Stay calendar</h3>
          <p className="te-cal__caption">{message}</p>
        </div>
        <button
          type="button"
          className="te-cal__nav-btn"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error ? <p className="te-cal__error">{error}</p> : null}

      <div className="te-cal__months">
        <MonthGrid
          monthDate={cursor}
          nightMap={nightMap}
          previewNights={previewNights}
          conflictNights={conflictNights}
        />
        <MonthGrid
          monthDate={addMonths(cursor, 1)}
          nightMap={nightMap}
          previewNights={previewNights}
          conflictNights={conflictNights}
        />
      </div>

      <div className="te-cal__legend" aria-hidden="true">
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--blocked" />
          Other confirmed
        </span>
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--preview" />
          This inquiry
        </span>
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--conflict" />
          Conflict
        </span>
      </div>
    </section>
  );
}
