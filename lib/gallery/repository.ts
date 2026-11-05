import { getPayloadClient } from "@/lib/payload";
import type { GalleryImageMeta } from "./types";

type GalleryDoc = {
  id: string | number;
  alt?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  url?: string | null;
  order?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function toMeta(doc: GalleryDoc): GalleryImageMeta | null {
  if (!doc.url) return null;
  return {
    id: String(doc.id),
    alt: doc.alt ?? "",
    mimeType: doc.mimeType ?? "image/jpeg",
    filename: doc.filename ?? "",
    order: typeof doc.order === "number" ? doc.order : 0,
    url: doc.url,
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

export async function listGalleryImages(): Promise<GalleryImageMeta[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "gallery-images",
    sort: "order",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  return (result.docs as GalleryDoc[])
    .map(toMeta)
    .filter((doc): doc is GalleryImageMeta => Boolean(doc));
}
