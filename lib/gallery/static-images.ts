import type { GalleryDisplayImage } from "./types";

/** First 9 gallery images — hardcoded; not managed via the dashboard. */
export const STATIC_GALLERY_IMAGES: GalleryDisplayImage[] = [
  {
    id: "static-0",
    src: "/gallery/01.webp",
    alt: "Bungalow living room with wooden furniture, a media console, and vaulted white ceilings",
  },
  {
    id: "static-1",
    src: "/gallery/02.webp",
    alt: "Living room with green wooden furniture, a stone accent wall, and forest views",
  },
  {
    id: "static-2",
    src: "/gallery/03.webp",
    alt: "Indoor dining room with a long table, chandelier, and forest-facing windows",
  },
  {
    id: "static-3",
    src: "/gallery/04.webp",
    alt: "Guest bedroom with twin beds, warm lighting, and a balcony looking over the forest",
  },
  {
    // Focus cell (row 2, center) — fills the viewport at gallery start.
    id: "static-4",
    src: "/gallery/05.webp",
    alt: "Night dining pavilion interior with fairy lights, wagon-wheel chandeliers, and a glowing moon wall",
  },
  {
    id: "static-5",
    src: "/gallery/06.webp",
    alt: "Ensuite bathroom with a vessel sink, glass shower, and warm lighting",
  },
  {
    id: "static-6",
    src: "/gallery/07.webp",
    alt: "Open living room looking through folding doors onto a stone terrace and forest",
  },
  {
    id: "static-7",
    src: "/gallery/08.webp",
    alt: "Covered terrace with a wooden dining table, bar counter, and stone archway",
  },
  {
    id: "static-8",
    src: "/gallery/09-bedroom.webp",
    alt: "Bedroom with grey headboards, an armchair, and a forest balcony view",
  },
];
