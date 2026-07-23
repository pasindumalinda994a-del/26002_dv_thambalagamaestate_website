"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  deleteGalleryImageAction,
  moveGalleryImageAction,
  updateGalleryImageAction,
  uploadGalleryImageAction,
} from "@/app/actions/gallery";
import { validateGalleryFile } from "@/lib/gallery/schema";
import { STATIC_GALLERY_IMAGES } from "@/lib/gallery/static-images";
import { galleryPublicSrc } from "@/lib/gallery/types";

export type GalleryManagerItem = {
  id: string;
  alt: string;
  mimeType: string;
  filename: string;
  order: number;
};

export function GalleryManager({ images }: { images: GalleryManagerItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(images);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function onUpload(e: React.FormEvent<HTMLFormElement>) {
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

    startTransition(async () => {
      const result = await uploadGalleryImageAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      setMessage("Image uploaded");
      refresh();
    });
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
              className="w-full border border-forest-green/25 bg-cream px-3 py-2.5 font-secondary text-sm text-forest-green file:mr-3 file:border-0 file:bg-transparent file:font-secondary file:text-sm file:font-semibold file:text-forest-green"
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
              className="w-full border border-forest-green/25 bg-cream px-3 py-2.5 font-secondary text-sm text-forest-green outline-none focus:border-forest-green"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-fit border border-forest-green bg-forest-green px-5 py-2.5 font-secondary text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-transparent hover:text-forest-green disabled:opacity-50"
          >
            {pending ? "Uploading…" : "Upload"}
          </button>
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
                disabled={pending}
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
            <button
              type="button"
              disabled={disabled || index === 0}
              onClick={onMoveUp}
              title="Move earlier in gallery"
              className="border border-forest-green/25 px-3 py-1.5 font-secondary text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-green transition-colors hover:bg-forest-green hover:text-cream disabled:opacity-40"
            >
              Up
            </button>
            <button
              type="button"
              disabled={disabled || index >= total - 1}
              onClick={onMoveDown}
              title="Move later in gallery"
              className="border border-forest-green/25 px-3 py-1.5 font-secondary text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-green transition-colors hover:bg-forest-green hover:text-cream disabled:opacity-40"
            >
              Down
            </button>
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
          <button
            type="button"
            disabled={disabled || altDraft.trim() === image.alt}
            onClick={() => onSaveAlt(image.id, altDraft.trim())}
            className="border border-forest-green/25 px-3 py-2 font-secondary text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-green transition-colors hover:bg-forest-green hover:text-cream disabled:opacity-40"
          >
            Save alt
          </button>
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
