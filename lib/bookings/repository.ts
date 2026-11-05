import type { CreateBookingInput } from "./schema";
import type { Booking, BookingStatus } from "./types";
import {
  expandStayNights,
  type ConfirmedStay,
} from "./dates";
import { getPayloadClient } from "@/lib/payload";

type BookingDoc = {
  id: string | number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  whatsapp: string;
  purpose?: Booking["purpose"] | null;
  specialRequests?: string | null;
  status: BookingStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function toBooking(doc: BookingDoc): Booking {
  return {
    id: String(doc.id),
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    adults: doc.adults,
    children: doc.children,
    fullName: doc.fullName,
    email: doc.email,
    whatsapp: doc.whatsapp,
    purpose: (doc.purpose ?? "") as Booking["purpose"],
    specialRequests: doc.specialRequests ?? "",
    status: doc.status,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt
        : new Date(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt
        : new Date(doc.updatedAt),
  };
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const payload = await getPayloadClient();
  const doc = (await payload.create({
    collection: "bookings",
    data: {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      children: input.children,
      fullName: input.fullName,
      email: input.email,
      whatsapp: input.whatsapp,
      purpose: input.purpose || null,
      specialRequests: input.specialRequests || "",
      status: "new",
    },
    overrideAccess: true,
  })) as BookingDoc;

  return toBooking(doc);
}

export async function listBookings(options?: {
  status?: BookingStatus | "all";
}): Promise<Booking[]> {
  const payload = await getPayloadClient();
  const where =
    options?.status && options.status !== "all"
      ? { status: { equals: options.status } }
      : undefined;

  const result = await payload.find({
    collection: "bookings",
    where,
    sort: "-createdAt",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  return (result.docs as BookingDoc[]).map(toBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const payload = await getPayloadClient();
  try {
    const doc = (await payload.findByID({
      collection: "bookings",
      id,
      depth: 0,
      overrideAccess: true,
    })) as BookingDoc;
    return toBooking(doc);
  } catch {
    return null;
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  const payload = await getPayloadClient();
  try {
    const doc = (await payload.update({
      collection: "bookings",
      id,
      data: { status },
      overrideAccess: true,
    })) as BookingDoc;
    return toBooking(doc);
  } catch {
    return null;
  }
}

export async function listConfirmedStays(): Promise<ConfirmedStay[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "bookings",
    where: { status: { equals: "confirmed" } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
    select: {
      fullName: true,
      checkIn: true,
      checkOut: true,
    },
  });

  return (result.docs as Pick<BookingDoc, "id" | "fullName" | "checkIn" | "checkOut">[]).map(
    (doc) => ({
      id: String(doc.id),
      fullName: doc.fullName,
      checkIn: doc.checkIn,
      checkOut: doc.checkOut,
    }),
  );
}

/**
 * Confirmed stay nights as YYYY-MM-DD keys (check-in inclusive, check-out exclusive).
 */
export async function listConfirmedUnavailableDates(): Promise<string[]> {
  const stays = await listConfirmedStays();
  const keys = new Set<string>();
  for (const stay of stays) {
    for (const night of expandStayNights(stay.checkIn, stay.checkOut)) {
      keys.add(night);
    }
  }
  return Array.from(keys).sort();
}

export async function findOverlappingConfirmedStays(input: {
  checkIn: string;
  checkOut: string;
  excludeId?: string;
}): Promise<ConfirmedStay[]> {
  const stays = await listConfirmedStays();
  const nights = new Set(expandStayNights(input.checkIn, input.checkOut));
  if (nights.size === 0) return [];

  return stays.filter((stay) => {
    if (input.excludeId && stay.id === input.excludeId) return false;
    return expandStayNights(stay.checkIn, stay.checkOut).some((n) =>
      nights.has(n),
    );
  });
}
