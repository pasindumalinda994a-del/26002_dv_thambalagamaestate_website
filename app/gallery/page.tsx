import { listGalleryImages } from "@/lib/gallery/repository";
import { STATIC_GALLERY_IMAGES } from "@/lib/gallery/static-images";
import {
  galleryPublicSrc,
  type GalleryDisplayImage,
} from "@/lib/gallery/types";
import { Header } from "../components/Header";
import { FooterSection } from "../homepagesections/Footer Section";
import { GalleryHero } from "./gallerysections/GalleryHero";

export default async function GalleryPage() {
  let dynamicImages: GalleryDisplayImage[] = [];

  try {
    const docs = await listGalleryImages();
    dynamicImages = docs.map((doc) => ({
      id: doc.id,
      src: galleryPublicSrc(doc.id),
      alt: doc.alt,
    }));
  } catch (error) {
    console.error("Failed to load gallery images from MongoDB", error);
  }

  const images = [...STATIC_GALLERY_IMAGES, ...dynamicImages];

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Header />
      <GalleryHero images={images} />
      <FooterSection />
    </main>
  );
}
