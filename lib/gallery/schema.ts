import {
  GALLERY_ALLOWED_MIME_TYPES,
  GALLERY_MAX_FILE_BYTES,
} from "./types";

/** Validate an upload before sending it to Payload admin / Local API. */
export function validateGalleryFile(file: {
  type: string;
  size: number;
  name: string;
}): { ok: true } | { ok: false; error: string } {
  if (
    !(GALLERY_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return {
      ok: false,
      error: "Only WebP, JPEG, and PNG images are allowed",
    };
  }
  if (file.size <= 0) {
    return { ok: false, error: "Empty file" };
  }
  if (file.size > GALLERY_MAX_FILE_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller" };
  }
  if (!file.name.trim()) {
    return { ok: false, error: "Filename is required" };
  }
  return { ok: true };
}
