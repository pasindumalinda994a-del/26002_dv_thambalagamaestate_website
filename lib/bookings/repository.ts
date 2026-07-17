import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "../db/mongodb";
import type { CreateBookingInput } from "./schema";
import type { Booking, BookingDocument, BookingStatus } from "./types";

const COLLECTION = "bookings";

let indexesEnsured = false;

async function getCollection(): Promise<Collection<BookingDocument>> {
  const db = await getDb();
  const collection = db.collection<BookingDocument>(COLLECTION);

  if (!indexesEnsured) {
    await Promise.all([
      collection.createIndex({ createdAt: -1 }),
      collection.createIndex({ status: 1, createdAt: -1 }),
    ]);
    indexesEnsured = true;
  }

  return collection;
}

function toBooking(doc: WithId<BookingDocument>): Booking {
  return {
    id: doc._id.toHexString(),
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    adults: doc.adults,
    children: doc.children,
    fullName: doc.fullName,
    email: doc.email,
    whatsapp: doc.whatsapp,
    purpose: doc.purpose,
    specialRequests: doc.specialRequests,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const collection = await getCollection();
  const now = new Date();
  const doc: BookingDocument = {
    ...input,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return {
    id: result.insertedId.toHexString(),
    ...doc,
  };
}

export async function listBookings(options?: {
  status?: BookingStatus | "all";
}): Promise<Booking[]> {
  const collection = await getCollection();
  const filter =
    options?.status && options.status !== "all"
      ? { status: options.status }
      : {};

  const docs = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return docs.map(toBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toBooking(doc) : null;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return result ? toBooking(result) : null;
}

/** Parse YYYY-MM-DD as a local calendar date (no UTC shift). */
function parseISODateLocal(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return new Date(y, m - 1, d);
}

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Confirmed stay nights as YYYY-MM-DD keys (check-in inclusive, check-out exclusive).
 */
export async function listConfirmedUnavailableDates(): Promise<string[]> {
  const collection = await getCollection();
  const docs = await collection
    .find(
      { status: "confirmed" },
      { projection: { checkIn: 1, checkOut: 1 } },
    )
    .toArray();

  const keys = new Set<string>();

  for (const doc of docs) {
    const start = parseISODateLocal(doc.checkIn);
    const end = parseISODateLocal(doc.checkOut);
    if (!start || !end || end <= start) continue;

    for (
      let cursor = new Date(start);
      cursor < end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      keys.add(toISODateLocal(cursor));
    }
  }

  return Array.from(keys).sort();
}
