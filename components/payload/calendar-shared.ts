import type { ConfirmedStay } from "@/lib/bookings/dates";
import { toISODateLocal } from "@/lib/bookings/dates";

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
