export const GALLERY_ALLOWED_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type GalleryMimeType = (typeof GALLERY_ALLOWED_MIME_TYPES)[number];

export const GALLERY_MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Public/admin list item. */
export type GalleryImageMeta = {
  id: string;
  alt: string;
  mimeType: string;
  filename: string;
  order: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Shape passed into the public gallery grid. */
export type GalleryDisplayImage = {
  id: string;
  src: string;
  alt: string;
};

export function galleryPublicSrc(url: string): string {
  return url;
}
