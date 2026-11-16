import type { CreateBookingInput } from "./schema";
import type { Booking, BookingStatus } from "./types";
import {
  expandStayNights,
  type ConfirmedStay,
  type DateBlock,
} from "./dates";
import { getPayloadClient } from "@/lib/payload";

type DateBlockDoc = {
  id: string | number;
  start: string;
  end: string;
  note?: string | null;
};

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

function toDateBlock(doc: DateBlockDoc): DateBlock {
  return {
    id: String(doc.id),
    start: doc.start,
    end: doc.end,
    note: typeof doc.note === "string" ? doc.note : "",
  };
}

export async function listDateBlocks(): Promise<DateBlock[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "date-blocks",
    limit: 500,
    depth: 0,
    overrideAccess: true,
    sort: "start",
    select: {
      start: true,
      end: true,
      note: true,
    },
  });

  return (result.docs as DateBlockDoc[]).map(toDateBlock);
}

export async function createDateBlock(input: {
  start: string;
  end: string;
  note?: string;
}): Promise<DateBlock> {
  const payload = await getPayloadClient();
  const doc = (await payload.create({
    collection: "date-blocks",
    data: {
      start: input.start,
      end: input.end,
      note: input.note?.trim() || "",
    },
    overrideAccess: true,
  })) as DateBlockDoc;

  return toDateBlock(doc);
}

export async function deleteDateBlock(id: string): Promise<boolean> {
  const payload = await getPayloadClient();
  try {
    await payload.delete({
      collection: "date-blocks",
      id,
      overrideAccess: true,
    });
    return true;
  } catch {
    return false;
  }
}

export async function updateDateBlock(
  id: string,
  data: { start: string; end: string; note?: string },
): Promise<DateBlock | null> {
  const payload = await getPayloadClient();
  try {
    const doc = (await payload.update({
      collection: "date-blocks",
      id,
      data: {
        start: data.start,
        end: data.end,
        ...(data.note !== undefined ? { note: data.note } : {}),
      },
      overrideAccess: true,
    })) as DateBlockDoc;
    return toDateBlock(doc);
  } catch {
    return null;
  }
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

/**
 * All unavailable nights: confirmed stays + manual date blocks.
 */
export async function listUnavailableDates(): Promise<string[]> {
  const [stays, blocks] = await Promise.all([
    listConfirmedStays(),
    listDateBlocks(),
  ]);
  const keys = new Set<string>();
  for (const stay of stays) {
    for (const night of expandStayNights(stay.checkIn, stay.checkOut)) {
      keys.add(night);
    }
  }
  for (const block of blocks) {
    for (const night of expandStayNights(block.start, block.end)) {
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

export async function findOverlappingDateBlocks(input: {
  checkIn: string;
  checkOut: string;
}): Promise<DateBlock[]> {
  const blocks = await listDateBlocks();
  const nights = new Set(expandStayNights(input.checkIn, input.checkOut));
  if (nights.size === 0) return [];

  return blocks.filter((block) =>
    expandStayNights(block.start, block.end).some((n) => nights.has(n)),
  );
}
