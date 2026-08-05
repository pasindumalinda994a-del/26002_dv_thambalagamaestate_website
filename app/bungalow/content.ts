export type BungalowImage = {
  src: string;
  alt: string;
};

export const BUNGALOW_HERO = {
  headline: "a heaven in the wild",
  scrollLabel: "scroll to explore",
  image: {
    src: "/balgalowpageimages/0C8A9932.JPG_2K_202607281106.jpeg",
    alt: "Thambalagama Estate bungalow in the rainforest",
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
      src: "/homepageimages/villa-gallery-bedroom-2.webp",
      alt: "Bungalow bedroom with forest light",
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
      src: "/homepageimages/experience-private-dining.webp",
      alt: "Private dining at the estate",
    },
    {
      src: "/homepageimages/experience-guided-trails.webp",
      alt: "Forest views from the estate",
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
    src: "/balgalowpageimages/DSC_0471.jpg_2K_202607261120.jpeg",
    alt: "Spring-fed natural pool at the estate",
  } satisfies BungalowImage,
} as const;

export const BUNGALOW_QUARTERS = {
  headline: "private quarters",
  images: [
    {
      src: "/homepageimages/villa-gallery-bedroom.webp",
      alt: "Private master suite",
    },
    {
      src: "/homepageimages/villa-gallery-living-room.webp",
      alt: "Private living quarters",
    },
    {
      src: "/homepageimages/villa-gallery-dining-room.webp",
      alt: "Private dining space",
    },
    {
      src: "/homepageimages/villa-gallery-indoor-outdoor.webp",
      alt: "Private bungalow surrounded by rainforest",
    },
  ] as const satisfies readonly BungalowImage[],
} as const;

export const BUNGALOW_CTA = {
  eyebrow: "The Estate Promise",
  buttonLabel: "Check Availability",
  bgSrc: "/homepageimages/cta-bg.webp",
} as const;
