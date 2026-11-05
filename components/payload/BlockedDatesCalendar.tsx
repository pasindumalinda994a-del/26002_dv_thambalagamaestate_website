"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConfirmedStay } from "@/lib/bookings/dates";
import { nightsByStay } from "@/lib/bookings/dates";
import {
  addMonths,
  fetchConfirmedStays,
  startOfMonth,
} from "./calendar-shared";
import { MonthGrid } from "./MonthGrid";

export function BlockedDatesCalendar() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [stays, setStays] = useState<ConfirmedStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchConfirmedStays();
      setStays(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load blocked dates",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const nightMap = useMemo(() => nightsByStay(stays), [stays]);
  const blockedCount = nightMap.size;

  return (
    <section className="te-cal" aria-label="Blocked nights calendar">
      <div className="te-cal__header">
        <div>
          <h2 className="te-cal__title">Occupancy calendar</h2>
          <p className="te-cal__caption">
            Confirmed stays lock these nights on the website booking calendar.
            {loading
              ? " Loading…"
              : ` ${blockedCount} night${blockedCount === 1 ? "" : "s"} blocked.`}
          </p>
        </div>
        <div className="te-cal__nav">
          <button
            type="button"
            className="te-cal__nav-btn"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            className="te-cal__nav-btn"
            onClick={() => setCursor(startOfMonth(new Date()))}
          >
            Today
          </button>
          <button
            type="button"
            className="te-cal__nav-btn"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            aria-label="Next month"
          >
            ›
          </button>
          <button
            type="button"
            className="te-cal__nav-btn"
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <p className="te-cal__error">{error}</p> : null}

      <div className="te-cal__months">
        <MonthGrid monthDate={cursor} nightMap={nightMap} />
        <MonthGrid monthDate={addMonths(cursor, 1)} nightMap={nightMap} />
      </div>

      <div className="te-cal__legend" aria-hidden="true">
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--blocked" />
          Blocked (confirmed)
        </span>
      </div>
    </section>
  );
}
