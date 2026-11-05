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
