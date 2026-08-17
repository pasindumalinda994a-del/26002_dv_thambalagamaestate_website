"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth/session";
import {
  deleteGalleryImage,
  moveGalleryImage,
  updateGalleryImage,
} from "@/lib/gallery/repository";
import {
  deleteGalleryImageSchema,
  moveGalleryImageSchema,
  updateGalleryImageSchema,
} from "@/lib/gallery/schema";
import type { GalleryImageMeta } from "@/lib/gallery/types";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateGalleryPaths() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function updateGalleryImageAction(
  input: unknown,
): Promise<ActionResult<GalleryImageMeta>> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateGalleryImageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid update",
    };
  }

  const { id, ...patch } = parsed.data;
  if (patch.alt === undefined && patch.order === undefined) {
    return { ok: false, error: "Nothing to update" };
  }

  try {
    const image = await updateGalleryImage(id, patch);
    if (!image) {
      return { ok: false, error: "Image not found" };
    }
    revalidateGalleryPaths();
    return { ok: true, data: image };
  } catch (error) {
    console.error("updateGalleryImageAction failed", error);
    return { ok: false, error: "Could not update image" };
  }
}

export async function deleteGalleryImageAction(
  input: unknown,
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = deleteGalleryImageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid delete request",
    };
  }

  try {
    const deleted = await deleteGalleryImage(parsed.data.id);
    if (!deleted) {
      return { ok: false, error: "Image not found" };
    }
    revalidateGalleryPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("deleteGalleryImageAction failed", error);
    return { ok: false, error: "Could not delete image" };
  }
}

export async function moveGalleryImageAction(
  input: unknown,
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = moveGalleryImageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reorder request",
    };
  }

  try {
    const moved = await moveGalleryImage(
      parsed.data.id,
      parsed.data.direction,
    );
    if (!moved) {
      return { ok: false, error: "Could not reorder images" };
    }
    revalidateGalleryPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("moveGalleryImageAction failed", error);
    return { ok: false, error: "Could not reorder images" };
  }
}
