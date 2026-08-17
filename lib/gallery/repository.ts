import {
  Binary,
  ObjectId,
  type Collection,
  type WithId,
} from "mongodb";
import { getDb } from "../db/mongodb";
import type {
  GalleryImageDocument,
  GalleryImageMeta,
  GalleryImageWithData,
  GalleryMimeType,
} from "./types";

const COLLECTION = "gallery_images";

let indexesEnsured = false;

async function getCollection(): Promise<Collection<GalleryImageDocument>> {
  const db = await getDb();
  const collection = db.collection<GalleryImageDocument>(COLLECTION);

  if (!indexesEnsured) {
    await Promise.all([
      collection.createIndex({ order: 1 }),
      collection.createIndex({ createdAt: -1 }),
      collection.createIndex({ filename: 1 }),
    ]);
    indexesEnsured = true;
  }

  return collection;
}

function toMeta(doc: WithId<GalleryImageDocument>): GalleryImageMeta {
  return {
    id: doc._id.toHexString(),
    alt: doc.alt,
    mimeType: doc.mimeType,
    filename: doc.filename,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listGalleryImages(): Promise<GalleryImageMeta[]> {
  const collection = await getCollection();
  const docs = await collection
    .find(
      {},
      {
        projection: {
          alt: 1,
          mimeType: 1,
          filename: 1,
          order: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    )
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  return docs.map((doc) => toMeta(doc as WithId<GalleryImageDocument>));
}

export async function getGalleryImageById(
  id: string,
): Promise<GalleryImageWithData | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  return {
    ...toMeta(doc),
    data: Buffer.from(doc.data.buffer),
  };
}

export async function getNextOrder(): Promise<number> {
  const collection = await getCollection();
  const last = await collection.find().sort({ order: -1 }).limit(1).toArray();
  if (last.length === 0) return 0;
  return last[0].order + 1;
}

export async function createGalleryImage(input: {
  alt: string;
  mimeType: GalleryMimeType;
  filename: string;
  data: Buffer;
  order?: number;
}): Promise<GalleryImageMeta> {
  const collection = await getCollection();
  const now = new Date();
  const order =
    typeof input.order === "number" ? input.order : await getNextOrder();

  const doc: GalleryImageDocument = {
    alt: input.alt,
    mimeType: input.mimeType,
    filename: input.filename,
    order,
    data: new Binary(input.data),
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);
  return {
    id: result.insertedId.toHexString(),
    alt: doc.alt,
    mimeType: doc.mimeType,
    filename: doc.filename,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function updateGalleryImage(
  id: string,
  patch: { alt?: string; order?: number },
): Promise<GalleryImageMeta | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();

  const $set: Partial<GalleryImageDocument> = { updatedAt: new Date() };
  if (typeof patch.alt === "string") $set.alt = patch.alt;
  if (typeof patch.order === "number") $set.order = patch.order;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set },
    {
      returnDocument: "after",
      projection: {
        alt: 1,
        mimeType: 1,
        filename: 1,
        order: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );

  return result ? toMeta(result as WithId<GalleryImageDocument>) : null;
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Move an image one step earlier (`up`) or later (`down`) in gallery order.
 * Re-reads the sorted list on the server (avoids stale client indexes) and
 * normalizes every document to contiguous order values 0..n-1.
 */
export async function moveGalleryImage(
  id: string,
  direction: "up" | "down",
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  const docs = await collection
    .find({}, { projection: { order: 1, createdAt: 1 } })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  const index = docs.findIndex((doc) => doc._id.toHexString() === id);
  if (index < 0) return false;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= docs.length) return false;

  const next = [...docs];
  const tmp = next[index];
  next[index] = next[swapWith];
  next[swapWith] = tmp;

  const now = new Date();
  await Promise.all(
    next.map((doc, order) =>
      collection.updateOne(
        { _id: doc._id },
        { $set: { order, updatedAt: now } },
      ),
    ),
  );
  return true;
}
