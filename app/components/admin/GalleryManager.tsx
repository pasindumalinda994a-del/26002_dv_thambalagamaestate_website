"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  deleteGalleryImageAction,
  moveGalleryImageAction,
  updateGalleryImageAction,
} from "@/app/actions/gallery";
import { validateGalleryFile } from "@/lib/gallery/schema";
import { STATIC_GALLERY_IMAGES } from "@/lib/gallery/static-images";
import { galleryPublicSrc } from "@/lib/gallery/types";
import { Button } from "../Button";

export type GalleryManagerItem = {
  id: string;
  alt: string;
  mimeType: string;
  filename: string;
  order: number;
};

type UploadResult =
  | { ok: true }
  | { ok: false; error: string };

function uploadGalleryImageWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/gallery");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      const percent = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100),
      );
      onProgress(percent);
    };

    xhr.upload.onload = () => {
      onProgress(100);
    };

    xhr.onload = () => {
      let payload: { ok?: boolean; error?: string } | null = null;
      try {
        payload = JSON.parse(xhr.responseText) as {
          ok?: boolean;
          error?: string;
        };
      } catch {
        payload = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload?.ok) {
        resolve({ ok: true });
        return;
      }

      resolve({
        ok: false,
        error:
          payload?.error ??
          (xhr.status === 401
            ? "Unauthorized"
            : "Could not upload image"),
      });
    };

    xhr.onerror = () => {
      resolve({ ok: false, error: "Could not upload image" });
    };

    xhr.onabort = () => {
      resolve({ ok: false, error: "Upload cancelled" });
    };

    xhr.send(formData);
  });
}

export function GalleryManager({ images }: { images: GalleryManagerItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(images);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"upload" | "saving">(
    "upload",
  );
  const [pending, startTransition] = useTransition();

  const busy = pending || uploading;

  useEffect(() => {
    setItems(images);
  }, [images]);

  function refresh() {
    router.refresh();
  }

  function onFileChange() {
    setError(null);
    setMessage(null);

    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const fileCheck = validateGalleryFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });
    if (!fileCheck.ok) {
      setError(fileCheck.error);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image to upload");
      return;
    }

    const fileCheck = validateGalleryFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });
    if (!fileCheck.ok) {
      setError(fileCheck.error);
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    if (alt.trim()) formData.set("alt", alt.trim());

    setUploading(true);
    setUploadProgress(0);
    setUploadPhase("upload");

    const result = await uploadGalleryImageWithProgress(formData, (percent) => {
      setUploadProgress(percent);
      if (percent >= 100) setUploadPhase("saving");
    });

    setUploading(false);
    setUploadProgress(0);
    setUploadPhase("upload");

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setAlt("");
    if (fileRef.current) fileRef.current.value = "";
    setMessage("Image uploaded");
    refresh();
  }

  function onSaveAlt(id: string, nextAlt: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateGalleryImageAction({ id, alt: nextAlt });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, alt: nextAlt } : item,
        ),
      );
      setMessage("Alt text saved");
      refresh();
    });
  }

  function onMove(id: string, direction: "up" | "down") {
    setError(null);
    setMessage(null);

    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= items.length) return;

    const previous = items;
    const next = [...items];
    const tmp = next[index];
    next[index] = { ...next[swapWith], order: index };
    next[swapWith] = { ...tmp, order: swapWith };
    setItems(next);

    startTransition(async () => {
      const result = await moveGalleryImageAction({ id, direction });
      if (!result.ok) {
        setItems(previous);
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  function onDelete(id: string, filename: string) {
    if (!window.confirm(`Delete “${filename}”? This cannot be undone.`)) {
      return;
    }
    setError(null);
    setMessage(null);

    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    startTransition(async () => {
      const result = await deleteGalleryImageAction({ id });
      if (!result.ok) {
        setItems(previous);
        setError(result.error);
        return;
      }
      setMessage("Image deleted");
      refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="border border-forest-green/15 bg-white px-5 py-5 sm:px-6">
        <h2 className="mb-2 font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
          Fixed site images
        </h2>
        <p className="mb-4 font-secondary text-sm text-forest-green/60">
          The first {STATIC_GALLERY_IMAGES.length} gallery images are built into
          the site and cannot be changed here.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
          {STATIC_GALLERY_IMAGES.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden bg-cream"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="80px"
                className="object-cover opacity-80"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border border-forest-green/15 bg-white px-5 py-5 sm:px-6">
        <h2 className="mb-4 font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
          Upload image
        </h2>
        <form onSubmit={onUpload} className="flex flex-col gap-4 sm:max-w-md">
          <label className="block">
            <span className="mb-1.5 block font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
              File
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/webp,image/jpeg,image/png,.webp,.jpg,.jpeg,.png"
              onChange={onFileChange}
              disabled={uploading}
              className="w-full border border-forest-green/25 bg-cream px-3 py-2.5 font-secondary text-sm text-forest-green file:mr-3 file:border-0 file:bg-transparent file:font-secondary file:text-sm file:font-semibold file:text-forest-green disabled:opacity-50"
            />
            <span className="mt-1.5 block font-secondary text-[12px] text-forest-green/50">
              WebP, JPEG, or PNG · max 5MB
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
              Alt text
            </span>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              maxLength={200}
              disabled={uploading}
              className="w-full border border-forest-green/25 bg-cream px-3 py-2.5 font-secondary text-sm text-forest-green outline-none focus:border-forest-green disabled:opacity-50"
            />
          </label>
          {uploading ? (
            <div className="space-y-2" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <span className="font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/60">
                  {uploadPhase === "saving"
                    ? "Saving image…"
                    : "Uploading…"}
                </span>
                <span className="font-secondary text-[12px] tabular-nums text-forest-green">
                  {uploadProgress}%
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden bg-forest-green/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
                aria-label="Upload progress"
              >
                <div
                  className="h-full bg-forest-green transition-[width] duration-150 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
          <Button
            type="submit"
            variant="dark"
            size="small"
            disabled={busy}
            showArrow={false}
            className="w-fit"
          >
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </section>

      {error ? (
        <p
          className="border border-chestnut/30 bg-white px-4 py-3 font-secondary text-sm text-chestnut"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          className="border border-forest-green/20 bg-white px-4 py-3 font-secondary text-sm text-forest-green"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <section>
        <h2 className="mb-2 font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
          Dashboard images ({items.length})
        </h2>
        <p className="mb-4 font-secondary text-sm text-forest-green/60">
          Use Up / Down to change the order after the fixed first nine on the
          public gallery.
        </p>
        {items.length === 0 ? (
          <p className="border border-forest-green/15 bg-white px-6 py-10 text-center font-secondary text-sm text-forest-green/60">
            No dashboard images yet. Upload above, or run{" "}
            <code className="text-forest-green">npm run seed:gallery</code> to
            load the original extras.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((img, index) => (
              <GalleryCard
                key={img.id}
                image={img}
                position={index + 1}
                index={index}
                total={items.length}
                disabled={busy}
                onSaveAlt={onSaveAlt}
                onMoveUp={() => onMove(img.id, "up")}
                onMoveDown={() => onMove(img.id, "down")}
                onDelete={() => onDelete(img.id, img.filename)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GalleryCard({
  image,
  position,
  index,
  total,
  disabled,
  onSaveAlt,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  image: GalleryManagerItem;
  position: number;
  index: number;
  total: number;
  disabled: boolean;
  onSaveAlt: (id: string, alt: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [altDraft, setAltDraft] = useState(image.alt);

  useEffect(() => {
    setAltDraft(image.alt);
  }, [image.alt]);

  return (
    <li className="flex flex-col gap-4 border border-forest-green/15 bg-white sm:flex-row">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-cream sm:aspect-square sm:w-36">
        <Image
          src={galleryPublicSrc(image.id)}
          alt={image.alt}
          fill
          sizes="144px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:py-4 sm:pr-4 sm:pl-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-secondary text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-green/50">
              Position {position}
            </p>
            <p className="mt-1 truncate font-secondary text-[13px] text-forest-green">
              {image.filename}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <Button
              type="button"
              variant="dark"
              size="small"
              disabled={disabled || index === 0}
              onClick={onMoveUp}
              title="Move earlier in gallery"
              showArrow={false}
            >
              Up
            </Button>
            <Button
              type="button"
              variant="dark"
              size="small"
              disabled={disabled || index >= total - 1}
              onClick={onMoveDown}
              title="Move later in gallery"
              showArrow={false}
            >
              Down
            </Button>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
            Alt text
          </span>
          <input
            type="text"
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            maxLength={200}
            className="w-full border border-forest-green/25 bg-cream px-3 py-2 font-secondary text-sm text-forest-green outline-none focus:border-forest-green"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="dark"
            size="small"
            disabled={disabled || altDraft.trim() === image.alt}
            onClick={() => onSaveAlt(image.id, altDraft.trim())}
            showArrow={false}
          >
            Save alt
          </Button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="border border-chestnut/40 px-3 py-2 font-secondary text-[11px] font-semibold uppercase tracking-[0.12em] text-chestnut transition-colors hover:bg-chestnut hover:text-cream disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
