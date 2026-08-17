import type { GalleryDisplayImage } from "./types";

/** First 9 gallery images — hardcoded; not managed via the dashboard. */
export const STATIC_GALLERY_IMAGES: GalleryDisplayImage[] = [
  {
    id: "static-0",
    src: "/gallery/01.webp",
    alt: "Gallery image 1",
  },
  {
    id: "static-1",
    src: "/gallery/02.webp",
    alt: "Gallery image 2",
  },
  {
    id: "static-2",
    src: "/gallery/03.webp",
    alt: "Gallery image 3",
  },
  {
    id: "static-3",
    src: "/gallery/04.webp",
    alt: "Gallery image 4",
  },
  {
    // Focus cell (row 2, center) — fills the viewport at gallery start.
    id: "static-4",
    src: "/gallery/05.webp",
    alt: "Gallery image 5",
  },
  {
    id: "static-5",
    src: "/gallery/06.webp",
    alt: "Gallery image 6",
  },
  {
    id: "static-6",
    src: "/gallery/07.webp",
    alt: "Gallery image 7",
  },
  {
    id: "static-7",
    src: "/gallery/08.webp",
    alt: "Gallery image 8",
  },
  {
    id: "static-8",
    src: "/gallery/09.webp",
    alt: "Gallery image 9",
  },
];
