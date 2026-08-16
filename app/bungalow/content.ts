export type BungalowImage = {
  src: string;
  alt: string;
};

export const BUNGALOW_HERO = {
  headline: "a heaven in the wild",
  scrollLabel: "scroll to explore",
  image: {
    src: "/balgalowpageimages/0C8A9933.webp",
    alt: "Thambalagama Estate bungalow at dusk",
  } satisfies BungalowImage,
} as const;

export const BUNGALOW_COMFORT = {
  headline: "Crafted for Comfort.",
  body: "Architecture designed to dissolve the boundary between refined luxury and the untamed rainforest. Every space is engineered for absolute solitude, ensuring an uninterrupted connection with nature without ever compromising on modern comfort.",
  accents: [
    {
      src: "/homepageimages/villa-gallery-bedroom.webp",
      alt: "Master suite bedroom",
    },
    {
      src: "/balgalowpageimages/DSC_0568.webp",
      alt: "Twin beds with teal accents and wooden headboard",
    },
  ] as const satisfies readonly BungalowImage[],
  mosaic: [
    {
      src: "/homepageimages/villa-gallery-living-room.webp",
      alt: "Living space opening to the forest",
    },
    {
      src: "/homepageimages/villa-gallery-dining-room.webp",
      alt: "Dining area in the bungalow",
    },
    {
      src: "/homepageimages/villa-gallery-indoor-outdoor.webp",
      alt: "Indoor-outdoor living at the estate",
    },
  ] as const satisfies readonly BungalowImage[],
  features: [
    "master suites & living spaces",
    "uninterrupted FOREST VIEWS",
    "climate controlled",
  ] as const,
} as const;

export const BUNGALOW_SPECS = {
  headline: "Estate specifications.",
  rows: [
    { label: "capacity", value: "Up to 18 Guests" },
    { label: "quarters", value: "6 Master Suites, 2 Twin Rooms" },
    {
      label: "bathrooms",
      value: "En-suite with freestanding tubs & rainfall showers",
    },
    {
      label: "service",
      value: "Private Chef, Estate Manager, Daily Housekeeping",
    },
    {
      label: "kitchen",
      value: "Fully equipped Chef's Kitchen, open dining plan",
    },
  ] as const,
  mosaic: [
    {
      src: "/homepageimages/villa-bg.webp",
      alt: "Estate bungalow exterior",
    },
    {
      src: "/balgalowpageimages/0C8A9906.webp",
      alt: "Evening patio dining under string lights and wagon-wheel chandeliers",
    },
    {
      src: "/balgalowpageimages/0C8A0018.webp",
      alt: "Ensuite bathroom with vessel sink, rainfall shower, and warm lighting",
    },
  ] as const satisfies readonly BungalowImage[],
  features: [
    "lounge & chef's kitchen",
    "panoramic windows",
    "climate controlled",
  ] as const,
} as const;

export const BUNGALOW_POOL = {
  label: "Spring-fed natural pool",
  image: {
    src: "/balgalowpageimages/0C8A0086.webp",
    alt: "Spring-fed natural pool with rock waterfall and mountain views",
  } satisfies BungalowImage,
} as const;

export const BUNGALOW_QUARTERS = {
  headline: "private quarters",
  images: [
    {
      src: "/balgalowpageimages/DSC_0568.webp",
      alt: "Twin beds with teal accents and wooden headboard",
    },
    {
      src: "/balgalowpageimages/DSC_0572.webp",
      alt: "Twin beds with leaf-pattern bedding and tufted headboard",
    },
    {
      src: "/balgalowpageimages/DSC_0577.webp",
      alt: "Bedside detail with floating nightstand and warm lighting",
    },
    {
      src: "/balgalowpageimages/DSC_0585.webp",
      alt: "Twin beds with pink floral bedding",
    },
    {
      src: "/balgalowpageimages/DSC_0593.webp",
      alt: "Twin beds with sage green bedding and floral wall art",
    },
    {
      src: "/balgalowpageimages/DSC_0596.webp",
      alt: "Double bed suite with botanical bedding and wooden headboard",
    },
    {
      src: "/balgalowpageimages/DSC_0599.webp",
      alt: "Double bed with floral art and amber reading lamps",
    },
    {
      src: "/balgalowpageimages/DSC_0611.webp",
      alt: "Floral suite with tufted headboard and wall art",
    },
  ] as const satisfies readonly BungalowImage[],
} as const;
