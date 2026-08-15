import type { Booking } from "@/lib/bookings/types";

export const ESTATE_TIMEZONE = "Asia/Colombo";

export type StayPhase =
  | "arriving"
  | "in_house"
  | "departing"
  | "upcoming"
  | "past";

export type DashboardPartition = {
  arriving: Booking[];
  inHouse: Booking[];
  departing: Booking[];
  needsReply: Booking[];
  thisWeek: Booking[];
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Today's calendar date in the estate timezone as YYYY-MM-DD. */
export function todayISO(timeZone = ESTATE_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return toISODate(year, month, day);
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return toISODate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatOpsDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function stayPhase(booking: Booking, today: string): StayPhase {
  if (booking.checkIn === today) return "arriving";
  if (booking.checkOut === today) return "departing";
  if (booking.checkIn < today && today < booking.checkOut) return "in_house";
  if (booking.checkIn > today) return "upcoming";
  return "past";
}

export function isArrivingToday(booking: Booking, today: string) {
  return booking.checkIn === today;
}

export function isDepartingToday(booking: Booking, today: string) {
  return booking.checkOut === today && booking.checkIn !== today;
}

export function isInHouse(booking: Booking, today: string) {
  return booking.checkIn < today && today < booking.checkOut;
}

function isDeclined(booking: Booking) {
  return booking.status === "declined";
}

function byCheckInThenName(a: Booking, b: Booking) {
  if (a.checkIn !== b.checkIn) return a.checkIn.localeCompare(b.checkIn);
  return a.fullName.localeCompare(b.fullName);
}

/** Upcoming and current stays first (by check-in), past stays last. */
export function sortByStayDate(bookings: Booking[], today: string): Booking[] {
  return [...bookings].sort((a, b) => {
    const aPast = a.checkOut < today ? 1 : 0;
    const bPast = b.checkOut < today ? 1 : 0;
    if (aPast !== bPast) return aPast - bPast;
    return byCheckInThenName(a, b);
  });
}

export function partitionForDashboard(
  bookings: Booking[],
  today: string,
): DashboardPartition {
  const arriving: Booking[] = [];
  const inHouse: Booking[] = [];
  const departing: Booking[] = [];
  const todayIds = new Set<string>();

  for (const booking of bookings) {
    if (isDeclined(booking)) continue;
    if (isArrivingToday(booking, today)) {
      arriving.push(booking);
      todayIds.add(booking.id);
    } else if (isInHouse(booking, today)) {
      inHouse.push(booking);
      todayIds.add(booking.id);
    } else if (isDepartingToday(booking, today)) {
      departing.push(booking);
      todayIds.add(booking.id);
    }
  }

  const weekEnd = addDaysISO(today, 7);
  const needsReply: Booking[] = [];
  const thisWeek: Booking[] = [];

  for (const booking of bookings) {
    if (isDeclined(booking)) continue;
    if (todayIds.has(booking.id)) continue;

    if (booking.status === "new") {
      needsReply.push(booking);
      continue;
    }

    if (
      booking.status === "contacted" &&
      booking.checkIn >= today
    ) {
      needsReply.push(booking);
      continue;
    }

    if (
      booking.status === "confirmed" &&
      booking.checkIn > today &&
      booking.checkIn <= weekEnd
    ) {
      thisWeek.push(booking);
    }
  }

  arriving.sort(byCheckInThenName);
  inHouse.sort(byCheckInThenName);
  departing.sort(byCheckInThenName);
  needsReply.sort(byCheckInThenName);
  thisWeek.sort(byCheckInThenName);

  return { arriving, inHouse, departing, needsReply, thisWeek };
}

export function todayBoardCount(partition: DashboardPartition) {
  return (
    partition.arriving.length +
    partition.inHouse.length +
    partition.departing.length
  );
}

export function formatOpsSummary(
  partition: DashboardPartition,
  newCount: number,
) {
  const parts: string[] = [];
  const push = (count: number, one: string, many: string) => {
    if (count <= 0) return;
    parts.push(`${count} ${count === 1 ? one : many}`);
  };

  push(partition.arriving.length, "arriving", "arriving");
  push(partition.inHouse.length, "in house", "in house");
  push(partition.departing.length, "departing", "departing");
  push(newCount, "new request", "new requests");

  if (parts.length === 0) {
    return "No stays or new requests today.";
  }
  return parts.join(" · ");
}
