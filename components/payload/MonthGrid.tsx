"use client";

import type { ConfirmedStay } from "@/lib/bookings/dates";
import {
  WEEKDAYS,
  buildMonthCells,
  monthLabel,
  stayTooltip,
} from "./calendar-shared";

type DayKind = "blocked" | "preview" | "conflict" | "plain";

type MonthGridProps = {
  monthDate: Date;
  nightMap: Map<string, ConfirmedStay[]>;
  /** Nights belonging to the inquiry being edited. */
  previewNights?: Set<string>;
  /** Preview nights that overlap another confirmed stay. */
  conflictNights?: Set<string>;
};

function dayKind(
  iso: string,
  nightMap: Map<string, ConfirmedStay[]>,
  previewNights?: Set<string>,
  conflictNights?: Set<string>,
): DayKind {
  if (conflictNights?.has(iso)) return "conflict";
  if (previewNights?.has(iso)) return "preview";
  if (nightMap.has(iso)) return "blocked";
  return "plain";
}

export function MonthGrid({
  monthDate,
  nightMap,
  previewNights,
  conflictNights,
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
          );
          const stays = nightMap.get(cell.iso) ?? [];
          const title =
            kind === "conflict"
              ? `Conflict — overlaps ${stayTooltip(stays) || "another stay"}`
              : kind === "preview"
                ? "This inquiry’s stay night"
                : kind === "blocked"
                  ? stayTooltip(stays)
                  : undefined;

          return (
            <div
              key={cell.iso}
              role="gridcell"
              title={title}
              className={[
                "te-cal-day",
                cell.inMonth ? "" : "te-cal-day--muted",
                kind !== "plain" ? `te-cal-day--${kind}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{cell.date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
