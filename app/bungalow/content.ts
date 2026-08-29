export type BungalowImage = {
  src: string;
  alt: string;
};

export type BungalowQuarterImage = BungalowImage & {
  name: string;
  room: number;
};

export const BUNGALOW_HERO = {
  headline: "a heaven in the wild",
  image: {
    src: "/bungalow/hero.webp",
    alt: "Infinity pool and lounge deck at Thambalagama Estate, with rainforest hills beyond",
  } satisfies BungalowImage,
} as const;

export const BUNGALOW_COMFORT = {
  headline: "Crafted for Comfort.",
  body: "Architecture designed to dissolve the boundary between refined luxury and the untamed rainforest. Every space is engineered for absolute solitude, ensuring an uninterrupted connection with nature without ever compromising on modern comfort.",
  accents: [
    {
      src: "/bungalow/comfort-01.webp",
      alt: "Guest bedroom",
    },
    {
      src: "/bungalow/comfort-02.webp",
      alt: "Bungalow bedroom with forest views",
    },
  ] as const satisfies readonly BungalowImage[],
  mosaic: [
    {
      src: "/bungalow/comfort-grid-01.webp",
      alt: "Living space opening to the forest",
    },
    {
      src: "/home/villa-gallery-04.webp",
      alt: "Dining area in the bungalow",
    },
    {
      src: "/home/villa-gallery-05.webp",
      alt: "Indoor-outdoor living at the estate",
    },
  ] as const satisfies readonly BungalowImage[],
  features: [
    "family rooms & living spaces",
    "uninterrupted FOREST VIEWS",
    "climate controlled",
  ] as const,
} as const;

export const BUNGALOW_SPECS = {
  headline: "Estate specifications.",
  rows: [
    { label: "capacity", value: "Up to 18 Guests" },
    { label: "quarters", value: "4 Family Rooms with 2 Queen Beds Each, 1 King Double" },
    {
      label: "bathrooms",
      value: "Private En-suite Bathrooms",
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
      src: "/bungalow/WhatsApp Image 2026-08-18 at 19.58.21.jpeg",
      alt: "Exterior of a modern two-story bungalow with grey stone pillars, a large shade tree, and tropical architecture",
    },
    {
      src: "/bungalow/specs-02.webp",
      alt: "Chef's kitchen with wooden cabinetry, black stone counters, and forest views",
    },
    {
      src: "/bungalow/specs-03.webp",
      alt: "Ensuite bathroom with vessel sink and warm lighting",
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
    src: "/bungalow/pool.webp",
    alt: "Spring-fed natural pool with rock waterfall and mountain views",
  } satisfies BungalowImage,
} as const;

export const BUNGALOW_QUARTERS = {
  headline: "private quarters",
  images: [
    {
      src: "/bungalow/quarters-malkoha-05.webp",
      alt: "Wood-slice door sign engraved with a Red-faced Malkoha",
      name: "Red-faced Malkoha",
      room: 1,
    },
    {
      src: "/bungalow/quarters-malkoha-02.webp",
      alt: "Sitting area with a blue sofa and Red-faced Malkoha artwork",
      name: "Red-faced Malkoha",
      room: 1,
    },
    {
      src: "/bungalow/quarters-malkoha-03.webp",
      alt: "Floating nightstand between twin beds with amber reading lamps",
      name: "Red-faced Malkoha",
      room: 1,
    },
    {
      src: "/bungalow/quarters-hornbill-04.webp",
      alt: "Wood-slice door sign engraved with a Gray Hornbill",
      name: "Gray Hornbill",
      room: 2,
    },
    {
      src: "/bungalow/quarters-hornbill-01.webp",
      alt: "Twin beds with sage bedding, wooden headboard, and tulip wall art",
      name: "Gray Hornbill",
      room: 2,
    },
    {
      src: "/bungalow/quarters-hornbill-02.webp",
      alt: "Gray Hornbill bedroom with twin beds, armchair, and forest-facing curtains",
      name: "Gray Hornbill",
      room: 2,
    },
    {
      src: "/bungalow/quarters-barbet-04.webp",
      alt: "Wood-slice door sign engraved with a Yellow-fronted Barbet",
      name: "Yellow-fronted Barbet",
      room: 3,
    },
    {
      src: "/bungalow/quarters-barbet-01.webp",
      alt: "Twin beds with pink floral bedding, mauve headboards, and floral wall art",
      name: "Yellow-fronted Barbet",
      room: 3,
    },
    {
      src: "/bungalow/quarters-magpie-04.webp",
      alt: "Wood-slice door sign engraved with a Blue Magpie",
      name: "Blue Magpie",
      room: 4,
    },
    {
      src: "/bungalow/quarters-magpie-01.webp",
      alt: "Twin beds with leaf-pattern bedding, balcony, and forest views",
      name: "Blue Magpie",
      room: 4,
    },
    {
      src: "/bungalow/quarters-magpie-02.webp",
      alt: "Twin beds with amber bedside lamps and floral wall art",
      name: "Blue Magpie",
      room: 4,
    },
    {
      src: "/bungalow/quarters-spurfowl-05.webp",
      alt: "Wood-slice door sign engraved with a Spurfowl",
      name: "Spurfowl",
      room: 5,
    },
    {
      src: "/bungalow/quarters-spurfowl-01.webp",
      alt: "Bed with floral bedding, tufted headboard, and yellow flower wall art",
      name: "Spurfowl",
      room: 5,
    },
    {
      src: "/bungalow/quarters-spurfowl-02.webp",
      alt: "Wooden vanity with round mirror, flowers, and water glasses",
      name: "Spurfowl",
      room: 5,
    },
    {
      src: "/bungalow/quarters-spurfowl-03.webp",
      alt: "Floating nightstand with globe lamp beside floral bedding",
      name: "Spurfowl",
      room: 5,
    },
  ] as const satisfies readonly BungalowQuarterImage[],
} as const;
