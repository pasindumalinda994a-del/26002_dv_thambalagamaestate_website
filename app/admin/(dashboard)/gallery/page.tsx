import { GalleryManager } from "@/app/components/admin/GalleryManager";
import { listGalleryImages } from "@/lib/gallery/repository";

export default async function AdminGalleryPage() {
  let images: {
    id: string;
    alt: string;
    mimeType: string;
    filename: string;
    order: number;
  }[] = [];
  let loadError: string | null = null;

  try {
    const docs = await listGalleryImages();
    images = docs.map((doc) => ({
      id: doc.id,
      alt: doc.alt,
      mimeType: doc.mimeType,
      filename: doc.filename,
      order: doc.order,
    }));
  } catch (error) {
    console.error("Failed to load admin gallery", error);
    loadError = "Could not load gallery images. Check the MongoDB connection.";
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold text-forest-green">
          Gallery
        </h1>
        <p className="mt-2 text-sm text-forest-green/60">
          Add, reorder, or remove images that appear after the first nine on the
          public gallery page.
        </p>
      </div>

      {loadError ? (
        <p
          className="border border-chestnut/30 bg-white px-6 py-8 text-center font-secondary text-sm text-chestnut"
          role="alert"
        >
          {loadError}
        </p>
      ) : (
        <GalleryManager images={images} />
      )}
    </>
  );
}
