import type { Binary } from "mongodb";

export const GALLERY_ALLOWED_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type GalleryMimeType = (typeof GALLERY_ALLOWED_MIME_TYPES)[number];

export const GALLERY_MAX_FILE_BYTES = 5 * 1024 * 1024;

export type GalleryImageDocument = {
  alt: string;
  mimeType: GalleryMimeType;
  filename: string;
  order: number;
  data: Binary;
  createdAt: Date;
  updatedAt: Date;
};

/** Public/admin list item — no binary payload. */
export type GalleryImageMeta = {
  id: string;
  alt: string;
  mimeType: GalleryMimeType;
  filename: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GalleryImageWithData = GalleryImageMeta & {
  data: Buffer;
};

/** Shape passed into the public gallery grid. */
export type GalleryDisplayImage = {
  id: string;
  src: string;
  alt: string;
};

export function galleryPublicSrc(id: string): string {
  return `/api/gallery/${id}`;
}
