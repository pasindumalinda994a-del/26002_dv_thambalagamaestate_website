import type { ConfirmedStay, DateBlock, OccupancySource } from "@/lib/bookings/dates";
import {
  addDaysISO,
  expandStayNights,
  inclusiveEndToExclusive,
  nightsBetweenInclusive,
  splitBlockAroundNight,
  toISODateLocal,
} from "@/lib/bookings/dates";

export { inclusiveEndToExclusive, nightsBetweenInclusive };

export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export type CalendarCell = {
  date: Date;
  iso: string;
  inMonth: boolean;
};

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function buildMonthCells(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const prevTotal = daysInMonth(year, month - 1);
  const cells: CalendarCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevTotal - i);
    cells.push({ date, iso: toISODateLocal(date), inMonth: false });
  }

  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, iso: toISODateLocal(date), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const date = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date, iso: toISODateLocal(date), inMonth: false });
  }

  return cells;
}

export function monthLabel(monthDate: Date): string {
  return monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function parseMonthFromIso(iso: string | undefined): Date {
  if (!iso) return startOfMonth(new Date());
  const match = /^(\d{4})-(\d{2})/.exec(iso);
  if (!match) return startOfMonth(new Date());
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

export function stayTooltip(stays: ConfirmedStay[]): string {
  if (stays.length === 0) return "";
  return stays
    .map((s) => `${s.fullName} (${s.checkIn} → ${s.checkOut})`)
    .join("\n");
}

export function occupancyTooltip(sources: OccupancySource[]): string {
  if (sources.length === 0) return "";
  return sources
    .map((s) => {
      const kind = s.kind === "manual" ? "Manual" : "Confirmed";
      return `${kind}: ${s.label} (${s.checkIn} → ${s.checkOut})`;
    })
    .join("\n");
}

export type ConfirmedStayDoc = {
  id: string | number;
  fullName?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
};

export function toConfirmedStay(doc: ConfirmedStayDoc): ConfirmedStay | null {
  if (!doc.checkIn || !doc.checkOut) return null;
  return {
    id: String(doc.id),
    fullName: doc.fullName?.trim() || "Guest",
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
  };
}

/** Fetch confirmed stays from Payload REST (admin cookie). */
export async function fetchConfirmedStays(): Promise<ConfirmedStay[]> {
  const params = new URLSearchParams();
  params.set("limit", "500");
  params.set("depth", "0");
  params.set("where[status][equals]", "confirmed");
  params.set("select[fullName]", "true");
  params.set("select[checkIn]", "true");
  params.set("select[checkOut]", "true");

  const res = await fetch(`/api/bookings?${params.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load confirmed stays (${res.status})`);
  }

  const json = (await res.json()) as { docs?: ConfirmedStayDoc[] };
  return (json.docs ?? [])
    .map(toConfirmedStay)
    .filter((s): s is ConfirmedStay => Boolean(s));
}

export type DateBlockDoc = {
  id: string | number;
  start?: string | null;
  end?: string | null;
  note?: string | null;
};

export function toDateBlock(doc: DateBlockDoc): DateBlock | null {
  if (!doc.start || !doc.end) return null;
  if (expandStayNights(doc.start, doc.end).length === 0) return null;
  return {
    id: String(doc.id),
    start: doc.start,
    end: doc.end,
    note: typeof doc.note === "string" ? doc.note : "",
  };
}

/** Fetch manual date blocks from Payload REST (admin cookie). */
export async function fetchDateBlocks(): Promise<DateBlock[]> {
  const params = new URLSearchParams();
  params.set("limit", "500");
  params.set("depth", "0");
  params.set("sort", "start");
  params.set("select[start]", "true");
  params.set("select[end]", "true");
  params.set("select[note]", "true");

  const res = await fetch(`/api/date-blocks?${params.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load date blocks (${res.status})`);
  }

  const json = (await res.json()) as { docs?: DateBlockDoc[] };
  return (json.docs ?? [])
    .map(toDateBlock)
    .filter((b): b is DateBlock => Boolean(b));
}

export async function createDateBlockRequest(input: {
  start: string;
  end: string;
  note?: string;
}): Promise<DateBlock> {
  const res = await fetch("/api/date-blocks", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start: input.start,
      end: input.end,
      note: input.note?.trim() || "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create date block (${res.status})`);
  }

  const json = (await res.json()) as { doc?: DateBlockDoc } & DateBlockDoc;
  const doc = json.doc ?? json;
  const block = toDateBlock(doc);
  if (!block) throw new Error("Invalid date block response");
  return block;
}

export async function deleteDateBlockRequest(id: string): Promise<void> {
  const res = await fetch(`/api/date-blocks/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete date block (${res.status})`);
  }
}

export async function updateDateBlockRequest(
  id: string,
  input: { start: string; end: string; note?: string },
): Promise<DateBlock> {
  const res = await fetch(`/api/date-blocks/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start: input.start,
      end: input.end,
      ...(input.note !== undefined ? { note: input.note } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update date block (${res.status})`);
  }

  const json = (await res.json()) as { doc?: DateBlockDoc } & DateBlockDoc;
  const doc = json.doc ?? json;
  const block = toDateBlock(doc);
  if (!block) throw new Error("Invalid date block response");
  return block;
}

/**
 * Remove a single night from manual blocks that cover it.
 * Deletes 1-night blocks, shrinks or splits multi-night ranges.
 */
export async function unblockNight(
  night: string,
  blocks: DateBlock[],
): Promise<void> {
  const covering = blocks.filter((block) =>
    expandStayNights(block.start, block.end).includes(night),
  );

  for (const block of covering) {
    const parts = splitBlockAroundNight(block.start, block.end, night);
    if (parts.length === 0) {
      await deleteDateBlockRequest(block.id);
      continue;
    }

    const [first, ...rest] = parts;
    await updateDateBlockRequest(block.id, {
      start: first.start,
      end: first.end,
      note: block.note,
    });
    for (const part of rest) {
      await createDateBlockRequest({
        start: part.start,
        end: part.end,
        note: block.note,
      });
    }
  }
}

/** Build a 1-night block end date (morning after). */
export function oneNightEnd(night: string): string | null {
  return addDaysISO(night, 1);
}
