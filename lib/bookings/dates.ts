/** Parse YYYY-MM-DD as a local calendar date (no UTC shift). */
export function parseISODateLocal(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return new Date(y, m - 1, d);
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Stay nights as YYYY-MM-DD keys (check-in inclusive, check-out exclusive).
 */
export function expandStayNights(checkIn: string, checkOut: string): string[] {
  const start = parseISODateLocal(checkIn);
  const end = parseISODateLocal(checkOut);
  if (!start || !end || end <= start) return [];

  const nights: string[] = [];
  for (
    let cursor = new Date(start);
    cursor < end;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    nights.push(toISODateLocal(cursor));
  }
  return nights;
}

export function nightCount(checkIn: string, checkOut: string): number {
  return expandStayNights(checkIn, checkOut).length;
}

export type ConfirmedStay = {
  id: string;
  fullName: string;
  checkIn: string;
  checkOut: string;
};

/** Manual closure stored as hotel-style nights (start inclusive, end exclusive). */
export type DateBlock = {
  id: string;
  start: string;
  end: string;
  note: string;
};

/** Occupancy source shown on admin calendars (confirmed stay or manual block). */
export type OccupancySource = {
  id: string;
  label: string;
  checkIn: string;
  checkOut: string;
  kind: "confirmed" | "manual";
};

export function stayAsOccupancy(stay: ConfirmedStay): OccupancySource {
  return {
    id: stay.id,
    label: stay.fullName,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    kind: "confirmed",
  };
}

export function blockAsOccupancy(block: DateBlock): OccupancySource {
  return {
    id: block.id,
    label: block.note.trim() || "Manual block",
    checkIn: block.start,
    checkOut: block.end,
    kind: "manual",
  };
}

/** Next calendar day as YYYY-MM-DD (local). */
export function addDaysISO(iso: string, days: number): string | null {
  const date = parseISODateLocal(iso);
  if (!date) return null;
  date.setDate(date.getDate() + days);
  return toISODateLocal(date);
}

/** Convert inclusive last night → exclusive checkout morning. */
export function inclusiveEndToExclusive(lastNight: string): string | null {
  return addDaysISO(lastNight, 1);
}

/** Nights from first night through last night (both inclusive). */
export function nightsBetweenInclusive(
  firstNight: string,
  lastNight: string,
): string[] {
  const exclusiveEnd = inclusiveEndToExclusive(lastNight);
  if (!exclusiveEnd) return [];
  return expandStayNights(firstNight, exclusiveEnd);
}

/** True if two stays share any night (exclusive checkout). */
export function staysOverlap(
  a: Pick<ConfirmedStay, "checkIn" | "checkOut">,
  b: Pick<ConfirmedStay, "checkIn" | "checkOut">,
): boolean {
  const aNights = new Set(expandStayNights(a.checkIn, a.checkOut));
  if (aNights.size === 0) return false;
  for (const night of expandStayNights(b.checkIn, b.checkOut)) {
    if (aNights.has(night)) return true;
  }
  return false;
}

/** Map each blocked night → stays that occupy it. */
export function nightsByStay(
  stays: ConfirmedStay[],
): Map<string, ConfirmedStay[]> {
  const map = new Map<string, ConfirmedStay[]>();
  for (const stay of stays) {
    for (const night of expandStayNights(stay.checkIn, stay.checkOut)) {
      const list = map.get(night) ?? [];
      list.push(stay);
      map.set(night, list);
    }
  }
  return map;
}

/** Map each blocked night → occupancy sources that occupy it. */
export function nightsByOccupancy(
  sources: OccupancySource[],
): Map<string, OccupancySource[]> {
  const map = new Map<string, OccupancySource[]>();
  for (const source of sources) {
    for (const night of expandStayNights(source.checkIn, source.checkOut)) {
      const list = map.get(night) ?? [];
      list.push(source);
      map.set(night, list);
    }
  }
  return map;
}

/**
 * After removing `night` from a block range, return zero, one, or two
 * replacement ranges (hotel-style start/end).
 */
export function splitBlockAroundNight(
  start: string,
  end: string,
  night: string,
): Array<{ start: string; end: string }> {
  const nights = expandStayNights(start, end);
  if (!nights.includes(night)) {
    return [{ start, end }];
  }

  const leftEnd = night;
  const rightStart = addDaysISO(night, 1);
  const parts: Array<{ start: string; end: string }> = [];

  if (expandStayNights(start, leftEnd).length > 0) {
    parts.push({ start, end: leftEnd });
  }
  if (rightStart && expandStayNights(rightStart, end).length > 0) {
    parts.push({ start: rightStart, end });
  }

  return parts;
}
