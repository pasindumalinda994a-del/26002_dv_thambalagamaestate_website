import { z } from "zod";
import {
  GALLERY_ALLOWED_MIME_TYPES,
  GALLERY_MAX_FILE_BYTES,
} from "./types";

export const updateGalleryImageSchema = z.object({
  id: z.string().min(1),
  alt: z.string().trim().min(1, "Alt text is required").max(200).optional(),
  order: z.coerce.number().int().min(0).max(10_000).optional(),
});

export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;

export const deleteGalleryImageSchema = z.object({
  id: z.string().min(1),
});

export type DeleteGalleryImageInput = z.infer<typeof deleteGalleryImageSchema>;

export const moveGalleryImageSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export type MoveGalleryImageInput = z.infer<typeof moveGalleryImageSchema>;

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
