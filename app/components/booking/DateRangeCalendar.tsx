"use client";

import { useMemo, useState } from "react";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangeCalendarProps = {
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** Extra blocked dates (past days are always unavailable). */
  unavailableDates?: Date[];
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** True if any stay night from `from` (inclusive) to `to` (exclusive) is unavailable. */
function rangeHasUnavailableNight(
  from: Date,
  to: Date,
  unavailableSet: Set<string>,
) {
  const cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor < end) {
    if (unavailableSet.has(dateKey(cursor))) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

type CalendarCell = {
  date: Date;
  inMonth: boolean;
};

function buildMonthCells(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const prevTotal = daysInMonth(year, month - 1);

  const cells: CalendarCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevTotal - i),
      inMonth: false,
    });
  }

  for (let d = 1; d <= total; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }

  const trailing = 7 - (cells.length % 7 || 7);
  if (trailing < 7) {
    for (let d = 1; d <= trailing; d++) {
      cells.push({ date: new Date(year, month + 1, d), inMonth: false });
    }
  }

  return cells;
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 3L11 8L6 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonthHeader({
  monthDate,
  showPrev,
  showNext,
  onPrev,
  onNext,
}: {
  monthDate: Date;
  showPrev?: boolean;
  showNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long" });
  const yearLabel = String(monthDate.getFullYear());

  return (
    <div className="mb-4 flex items-center justify-center gap-6">
      {showPrev ? (
        <button
          type="button"
          aria-label="Previous months"
          onClick={onPrev}
          className="flex h-7 w-7 shrink-0 items-center justify-center text-forest-green/70 transition-opacity hover:opacity-100"
        >
          <ChevronLeft />
        </button>
      ) : null}

      <p className="flex items-baseline gap-1.5 px-0.5 text-[15px] text-forest-green">
        <span className="font-secondary font-medium">{monthLabel}</span>
        <span className="font-secondary font-medium">{yearLabel}</span>
      </p>

      {showNext ? (
        <button
          type="button"
          aria-label="Next months"
          onClick={onNext}
          className="flex h-7 w-7 shrink-0 items-center justify-center text-forest-green/70 transition-opacity hover:opacity-100"
        >
          <ChevronRight />
        </button>
      ) : null}
    </div>
  );
}

function DayCell({
  cell,
  range,
  unavailable,
  onSelect,
}: {
  cell: CalendarCell;
  range: DateRange;
  unavailable: boolean;
  onSelect: (day: Date) => void;
}) {
  const { date, inMonth } = cell;
  const isFrom = range.from ? isSameDay(date, range.from) : false;
  const isTo = range.to ? isSameDay(date, range.to) : false;
  const isEndpoint = isFrom || isTo;
  const hasRange = Boolean(range.from && range.to);
  const inRange =
    hasRange &&
    range.from &&
    range.to &&
    date > range.from &&
    date < range.to;

  const showRangeTrack = hasRange && (inRange || isEndpoint);

  let trackClass = "absolute inset-y-[18%] bg-[#e4dfcf]";
  if (isFrom && hasRange) {
    trackClass += " left-1/2 right-0";
  } else if (isTo && hasRange) {
    trackClass += " left-0 right-1/2";
  } else if (inRange) {
    trackClass += " inset-x-0";
  }

  return (
    <div className="relative flex aspect-square items-center justify-center">
      {showRangeTrack ? <span className={trackClass} aria-hidden /> : null}

      <button
        type="button"
        disabled={unavailable}
        onClick={() => onSelect(date)}
        aria-label={date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        aria-pressed={isEndpoint}
        className={[
          "relative z-10 flex h-[78%] w-[78%] items-center justify-center font-secondary text-[13px] font-medium transition-colors",
          unavailable
            ? "cursor-not-allowed text-forest-green line-through opacity-40"
            : isEndpoint
              ? "rounded-[5px] bg-forest-green text-cream"
              : inMonth
                ? "text-forest-green hover:bg-forest-green/8"
                : "text-forest-green/35 hover:bg-forest-green/8",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {date.getDate()}
      </button>
    </div>
  );
}

function MonthGrid({
  monthDate,
  range,
  today,
  unavailableSet,
  onSelect,
  showPrev,
  showNext,
  onPrev,
  onNext,
}: {
  monthDate: Date;
  range: DateRange;
  today: Date;
  unavailableSet: Set<string>;
  onSelect: (day: Date) => void;
  showPrev?: boolean;
  showNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const cells = useMemo(() => buildMonthCells(monthDate), [monthDate]);

  return (
    <div className="min-w-0 flex-1">
      <MonthHeader
        monthDate={monthDate}
        showPrev={showPrev}
        showNext={showNext}
        onPrev={onPrev}
        onNext={onNext}
      />

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, i) => (
          <span
            key={`${day}-${i}`}
            className="pb-2 font-secondary text-[12px] font-medium text-forest-green/40"
          >
            {day}
          </span>
        ))}

        {cells.map((cell) => {
          const unavailable =
            cell.date < today || unavailableSet.has(dateKey(cell.date));

          return (
            <DayCell
              key={dateKey(cell.date) + (cell.inMonth ? "-in" : "-out")}
              cell={cell}
              range={range}
              unavailable={unavailable}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

export function DateRangeCalendar({
  value,
  onChange,
  unavailableDates = [],
}: DateRangeCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewStart, setViewStart] = useState(() => {
    const base = value.from ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const secondMonth = addMonths(viewStart, 1);

  const unavailableSet = useMemo(() => {
    const set = new Set<string>();
    for (const d of unavailableDates) {
      set.add(dateKey(startOfDay(d)));
    }
    return set;
  }, [unavailableDates]);

  const handleSelect = (day: Date) => {
    const selected = startOfDay(day);
    if (selected < today || unavailableSet.has(dateKey(selected))) return;

    if (!value.from || (value.from && value.to)) {
      onChange({ from: selected, to: null });
      return;
    }

    if (selected < value.from) {
      // Swap: treat earlier day as new start only if the span is clear.
      if (rangeHasUnavailableNight(selected, value.from, unavailableSet)) {
        onChange({ from: selected, to: null });
        return;
      }
      onChange({ from: selected, to: value.from });
      return;
    }

    if (isSameDay(selected, value.from)) {
      onChange({ from: selected, to: null });
      return;
    }

    if (rangeHasUnavailableNight(value.from, selected, unavailableSet)) {
      // Keep start; ignore end that crosses a blocked stay.
      return;
    }

    onChange({ from: value.from, to: selected });
  };

  const goPrev = () => setViewStart((d) => addMonths(d, -1));
  const goNext = () => setViewStart((d) => addMonths(d, 1));

  return (
    <div className="border-[1.24px] border-forest-green/25 p-[19.91px]">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <MonthGrid
          monthDate={viewStart}
          range={value}
          today={today}
          unavailableSet={unavailableSet}
          onSelect={handleSelect}
          showPrev
          showNext
          onPrev={goPrev}
          onNext={goNext}
        />

        <MonthGrid
          monthDate={secondMonth}
          range={value}
          today={today}
          unavailableSet={unavailableSet}
          onSelect={handleSelect}
          showPrev
          showNext
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </div>
  );
}
