"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConfirmedStay, DateBlock, OccupancySource } from "@/lib/bookings/dates";
import {
  blockAsOccupancy,
  expandStayNights,
  nightsBetweenInclusive,
  nightsByOccupancy,
  stayAsOccupancy,
} from "@/lib/bookings/dates";
import {
  addMonths,
  createDateBlockRequest,
  fetchConfirmedStays,
  fetchDateBlocks,
  inclusiveEndToExclusive,
  oneNightEnd,
  startOfMonth,
  unblockNight,
} from "./calendar-shared";
import { MonthGrid } from "./MonthGrid";

type SelectMode = "click" | "range";

type RangeDraft = {
  start: string | null;
  hover: string | null;
};

type BlockedDatesCalendarProps = {
  /** Called after a successful create/unblock so parents can refresh KPIs. */
  onBlocksChanged?: () => void;
};

function formatNightLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatRangeLabel(start: string, lastNight: string, count: number): string {
  const a = formatNightLabel(start);
  const b = formatNightLabel(lastNight);
  if (start === lastNight) {
    return `${a} (${count} night)`;
  }
  return `${a}–${b} (${count} night${count === 1 ? "" : "s"})`;
}

export function BlockedDatesCalendar({
  onBlocksChanged,
}: BlockedDatesCalendarProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [stays, setStays] = useState<ConfirmedStay[]>([]);
  const [blocks, setBlocks] = useState<DateBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingNights, setPendingNights] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectMode>("click");
  const [rangeDraft, setRangeDraft] = useState<RangeDraft>({
    start: null,
    hover: null,
  });
  const [rangeNote, setRangeNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextStays, nextBlocks] = await Promise.all([
        fetchConfirmedStays(),
        fetchDateBlocks(),
      ]);
      setStays(nextStays);
      setBlocks(nextBlocks);
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

  const sources = useMemo<OccupancySource[]>(
    () => [
      ...stays.map(stayAsOccupancy),
      ...blocks.map(blockAsOccupancy),
    ],
    [stays, blocks],
  );

  const nightMap = useMemo(() => nightsByOccupancy(sources), [sources]);
  const blockedCount = nightMap.size;

  const confirmedNights = useMemo(() => {
    const keys = new Set<string>();
    for (const stay of stays) {
      for (const night of expandStayNights(stay.checkIn, stay.checkOut)) {
        keys.add(night);
      }
    }
    return keys;
  }, [stays]);

  const rangePreviewNights = useMemo(() => {
    if (mode !== "range" || !rangeDraft.start) return undefined;

    const endNight =
      rangeDraft.hover && rangeDraft.hover >= rangeDraft.start
        ? rangeDraft.hover
        : rangeDraft.start;

    return new Set(nightsBetweenInclusive(rangeDraft.start, endNight));
  }, [mode, rangeDraft.start, rangeDraft.hover]);

  const caption = useMemo(() => {
    if (loading) return "Loading…";
    if (success) return success;
    if (mode === "range") {
      if (rangeDraft.start) {
        return `First night ${formatNightLabel(rangeDraft.start)}. Click the last night to block, or Cancel.`;
      }
      return "Block range: click the first night, then the last night to include.";
    }
    return `Tap a free night to block it, or a manual block to unblock. ${blockedCount} night${blockedCount === 1 ? "" : "s"} locked.`;
  }, [loading, success, mode, rangeDraft.start, blockedCount]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleDayHover = useCallback(
    (iso: string | null) => {
      if (mode !== "range" || !rangeDraft.start || busy) return;
      setRangeDraft((draft) => ({ ...draft, hover: iso }));
    },
    [mode, rangeDraft.start, busy],
  );

  const handleDayClick = useCallback(
    async (iso: string) => {
      if (busy || loading) return;

      const occupying = nightMap.get(iso) ?? [];
      if (occupying.some((s) => s.kind === "confirmed")) return;

      clearFeedback();
      setBusy(true);

      try {
        if (mode === "click") {
          const hasManual = occupying.some((s) => s.kind === "manual");
          setPendingNights(new Set([iso]));

          if (hasManual) {
            await unblockNight(iso, blocks);
            setSuccess(`Unblocked ${formatNightLabel(iso)}`);
          } else {
            const end = oneNightEnd(iso);
            if (!end) throw new Error("Invalid date");
            await createDateBlockRequest({ start: iso, end });
            setSuccess(`Blocked ${formatNightLabel(iso)} (1 night)`);
          }
          await load();
          onBlocksChanged?.();
          return;
        }

        // Range mode: first click = first night; second = last night (inclusive).
        if (!rangeDraft.start) {
          if (confirmedNights.has(iso)) {
            setError("Range cannot start on a confirmed stay night.");
            return;
          }
          setRangeDraft({ start: iso, hover: iso });
          return;
        }

        const start = rangeDraft.start;
        if (iso < start) {
          setError("Choose a last night on or after the first night.");
          return;
        }

        // Same night again confirms a 1-night range.
        const lastNight = iso;
        const nights = nightsBetweenInclusive(start, lastNight);
        if (nights.length === 0) {
          setError("Choose a last night on or after the first night.");
          return;
        }
        if (nights.some((n) => confirmedNights.has(n))) {
          setError("Range overlaps a confirmed stay. Pick different dates.");
          setRangeDraft({ start: null, hover: null });
          return;
        }

        const exclusiveEnd = inclusiveEndToExclusive(lastNight);
        if (!exclusiveEnd) throw new Error("Invalid date");

        setPendingNights(new Set(nights));
        await createDateBlockRequest({
          start,
          end: exclusiveEnd,
          note: rangeNote,
        });
        setRangeDraft({ start: null, hover: null });
        setRangeNote("");
        setSuccess(`Blocked ${formatRangeLabel(start, lastNight, nights.length)}`);
        await load();
        onBlocksChanged?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update blocks");
      } finally {
        setBusy(false);
        setPendingNights(new Set());
      }
    },
    [
      busy,
      loading,
      nightMap,
      mode,
      blocks,
      load,
      rangeDraft.start,
      rangeNote,
      confirmedNights,
      onBlocksChanged,
      clearFeedback,
    ],
  );

  const switchMode = useCallback((next: SelectMode) => {
    setMode(next);
    setRangeDraft({ start: null, hover: null });
    setError(null);
    setSuccess(null);
  }, []);

  return (
    <section className="te-cal" aria-label="Block dates calendar">
      <div className="te-cal__header">
        <div>
          <h2 className="te-cal__title">Block dates</h2>
          <p
            className={`te-cal__caption${success && !loading ? " te-cal__caption--success" : ""}`}
          >
            {caption}
          </p>
        </div>
        <div className="te-cal__nav">
          <div className="te-cal__mode" role="group" aria-label="Selection mode">
            <button
              type="button"
              className={`te-cal__nav-btn${mode === "click" ? " te-cal__nav-btn--active" : ""}`}
              onClick={() => switchMode("click")}
              disabled={busy}
            >
              Tap nights
            </button>
            <button
              type="button"
              className={`te-cal__nav-btn${mode === "range" ? " te-cal__nav-btn--active" : ""}`}
              onClick={() => switchMode("range")}
              disabled={busy}
            >
              Block range
            </button>
          </div>
          {mode === "range" && rangeDraft.start ? (
            <button
              type="button"
              className="te-cal__nav-btn"
              onClick={() => {
                setRangeDraft({ start: null, hover: null });
                clearFeedback();
              }}
              disabled={busy}
            >
              Cancel
            </button>
          ) : null}
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
            disabled={loading || busy}
          >
            Refresh
          </button>
        </div>
      </div>

      {mode === "range" ? (
        <div className="te-cal__note">
          <label className="te-cal__note-label" htmlFor="te-cal-range-note">
            Reason <span className="te-cal__note-optional">(optional)</span>
          </label>
          <input
            id="te-cal-range-note"
            type="text"
            className="te-cal__note-input"
            maxLength={200}
            placeholder="e.g. Owner visit"
            value={rangeNote}
            onChange={(e) => setRangeNote(e.target.value)}
            disabled={busy}
          />
        </div>
      ) : null}

      {error ? <p className="te-cal__error">{error}</p> : null}

      <div
        className={`te-cal__months${busy ? " te-cal__months--busy" : ""}`}
        onMouseLeave={() => handleDayHover(null)}
      >
        <MonthGrid
          monthDate={cursor}
          nightMap={nightMap}
          rangePreviewNights={rangePreviewNights}
          pendingNights={pendingNights}
          onDayClick={(iso) => void handleDayClick(iso)}
          onDayHover={handleDayHover}
          interactive
          rangePicking={mode === "range" && Boolean(rangeDraft.start)}
        />
        <MonthGrid
          monthDate={addMonths(cursor, 1)}
          nightMap={nightMap}
          rangePreviewNights={rangePreviewNights}
          pendingNights={pendingNights}
          onDayClick={(iso) => void handleDayClick(iso)}
          onDayHover={handleDayHover}
          interactive
          rangePicking={mode === "range" && Boolean(rangeDraft.start)}
        />
      </div>

      <div className="te-cal__legend" aria-hidden="true">
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--blocked" />
          Confirmed stay
        </span>
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--manual" />
          Manual block
        </span>
        <span className="te-cal__legend-item">
          <span className="te-cal-swatch te-cal-swatch--range" />
          Range selection
        </span>
      </div>
    </section>
  );
}
