import { listGalleryImages } from "@/lib/gallery/repository";
import { STATIC_GALLERY_IMAGES } from "@/lib/gallery/static-images";
import {
  galleryPublicSrc,
  type GalleryDisplayImage,
} from "@/lib/gallery/types";
import { Header } from "@/app/components/Header";
import { FooterSection } from "@/app/homepagesections/Footer Section";
import { GalleryHero } from "./gallerysections/GalleryHero";
import { buildPageMetadata } from "@/lib/seo";

// Do not prerender. A build without Payload env vars would otherwise
// freeze an empty CMS gallery into the static HTML.
export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Gallery — Sinharaja Rainforest & Estate",
  description:
    "Photos from Thambalagama Estate and Sinharaja Forest Sri Lanka — rainforest atmosphere, bungalow stays, and Travel Sri Lanka inspiration.",
  path: "/gallery",
});

export default async function GalleryPage() {
  let dynamicImages: GalleryDisplayImage[] = [];

  try {
    const docs = await listGalleryImages();
    dynamicImages = docs.map((doc) => ({
      id: doc.id,
      src: galleryPublicSrc(doc.url),
      alt: doc.alt,
    }));
  } catch (error) {
    console.error("Failed to load gallery images from Payload", error);
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
