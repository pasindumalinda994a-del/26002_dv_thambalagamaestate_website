import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { createGalleryImage } from "@/lib/gallery/repository";
import { validateGalleryFile } from "@/lib/gallery/schema";
import type { GalleryMimeType } from "@/lib/gallery/types";

function revalidateGalleryPaths() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const altRaw = formData.get("alt");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Image file is required" },
      { status: 400 },
    );
  }

  const alt =
    typeof altRaw === "string" && altRaw.trim()
      ? altRaw.trim()
      : file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") ||
        "Gallery image";

  const fileCheck = validateGalleryFile({
    type: file.type,
    size: file.size,
    name: file.name,
  });
  if (!fileCheck.ok) {
    return NextResponse.json(
      { ok: false, error: fileCheck.error },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await createGalleryImage({
      alt: alt.slice(0, 200),
      mimeType: file.type as GalleryMimeType,
      filename: file.name.slice(0, 200),
      data: buffer,
    });
    revalidateGalleryPaths();
    return NextResponse.json({ ok: true, data: image });
  } catch (error) {
    console.error("POST /api/gallery failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not upload image" },
      { status: 500 },
    );
  }
}
