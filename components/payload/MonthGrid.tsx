"use client";

import type { OccupancySource } from "@/lib/bookings/dates";
import {
  WEEKDAYS,
  buildMonthCells,
  monthLabel,
  occupancyTooltip,
} from "./calendar-shared";

type DayKind =
  | "blocked"
  | "manual"
  | "preview"
  | "conflict"
  | "range"
  | "plain";

type MonthGridProps = {
  monthDate: Date;
  nightMap: Map<string, OccupancySource[]>;
  /** Nights belonging to the inquiry being edited. */
  previewNights?: Set<string>;
  /** Preview nights that overlap another occupied night. */
  conflictNights?: Set<string>;
  /** Nights highlighted while picking a manual range. */
  rangePreviewNights?: Set<string>;
  /** Nights currently being written (block/unblock in flight). */
  pendingNights?: Set<string>;
  onDayClick?: (iso: string) => void;
  onDayHover?: (iso: string | null) => void;
  interactive?: boolean;
  /** When true, free-night tooltips say "End range…"; manual nights stay unblockable only in tap mode. */
  rangePicking?: boolean;
};

function dayKind(
  iso: string,
  nightMap: Map<string, OccupancySource[]>,
  previewNights?: Set<string>,
  conflictNights?: Set<string>,
  rangePreviewNights?: Set<string>,
): DayKind {
  if (conflictNights?.has(iso)) return "conflict";
  if (previewNights?.has(iso)) return "preview";
  if (rangePreviewNights?.has(iso)) return "range";
  const sources = nightMap.get(iso);
  if (sources && sources.length > 0) {
    if (sources.some((s) => s.kind === "confirmed")) return "blocked";
    return "manual";
  }
  return "plain";
}

export function MonthGrid({
  monthDate,
  nightMap,
  previewNights,
  conflictNights,
  rangePreviewNights,
  pendingNights,
  onDayClick,
  onDayHover,
  interactive = false,
  rangePicking = false,
}: MonthGridProps) {
  const cells = buildMonthCells(monthDate);

  return (
    <div className="te-cal-month">
      <div className="te-cal-month__title">{monthLabel(monthDate)}</div>
      <div className="te-cal-weekdays" aria-hidden="true">
        {WEEKDAYS.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="te-cal-grid" role="grid" aria-label={monthLabel(monthDate)}>
        {cells.map((cell) => {
          const kind = dayKind(
            cell.iso,
            nightMap,
            previewNights,
            conflictNights,
            rangePreviewNights,
          );
          const sources = nightMap.get(cell.iso) ?? [];
          const hasConfirmed = sources.some((s) => s.kind === "confirmed");
          const hasManual =
            !hasConfirmed && sources.some((s) => s.kind === "manual");
          const isPending = pendingNights?.has(cell.iso) ?? false;
          const clickable = Boolean(interactive && onDayClick && !hasConfirmed);

          let title: string | undefined;
          if (kind === "conflict") {
            title = `Conflict — overlaps ${occupancyTooltip(sources) || "another hold"}`;
          } else if (kind === "preview") {
            title = "This inquiry’s stay night";
          } else if (hasConfirmed) {
            title = occupancyTooltip(sources) || "Confirmed stay";
          } else if (rangePicking && clickable) {
            title = "End range on this night";
          } else if (hasManual) {
            title = occupancyTooltip(sources)
              ? `Unblock — ${occupancyTooltip(sources)}`
              : "Unblock this night";
          } else if (kind === "range") {
            title = "Selected range night";
          } else if (clickable) {
            title = "Block this night";
          }

          const className = [
            "te-cal-day",
            cell.inMonth ? "" : "te-cal-day--muted",
            kind !== "plain" ? `te-cal-day--${kind}` : "",
            clickable ? "te-cal-day--clickable" : "",
            interactive && hasConfirmed ? "te-cal-day--locked" : "",
            isPending ? "te-cal-day--pending" : "",
          ]
            .filter(Boolean)
            .join(" ");

          if (clickable) {
            return (
              <button
                key={cell.iso}
                type="button"
                role="gridcell"
                title={title}
                className={className}
                disabled={isPending}
                onClick={() => onDayClick?.(cell.iso)}
                onMouseEnter={() => onDayHover?.(cell.iso)}
                onMouseLeave={() => onDayHover?.(null)}
                onFocus={() => onDayHover?.(cell.iso)}
                onBlur={() => onDayHover?.(null)}
              >
                <span>{cell.date.getDate()}</span>
              </button>
            );
          }

          return (
            <div
              key={cell.iso}
              role="gridcell"
              title={title}
              className={className}
              onMouseEnter={() => onDayHover?.(cell.iso)}
              onMouseLeave={() => onDayHover?.(null)}
            >
              <span>{cell.date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
