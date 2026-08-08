export type ExperiencesImage = {
  src: string;
  alt: string;
};

export const EXPERIENCES_HERO = {
  headlineDesktop: "Into the rhythm of forest",
  headlineMobile: "A Glimpse Beyond the Border.",
  scrollLabel: "scroll to explore",
  image: {
    src: "/forestpageimages/things-to-do.webp",
    alt: "Aerial view of misty rainforest canopy surrounding Thambalagama Estate",
  } satisfies ExperiencesImage,
} as const;

export const EXPERIENCES_INTRO = {
  headline: "Curated Wilderness.",
  body: "This is not merely a place to stay, but a gateway. Our experiences are designed to let you interact with the untouched rainforest on your own private terms, blending raw exploration with refined comfort.",
} as const;

export const EXPERIENCES_TRAILS = {
  headline: "Guided Trails Through the Estate.",
  body: "Step past the edge of the estate with our expert trackers to explore the borders of the ancient Sinharaja canopy. Walk hidden trails to encounter rare, endemic wildlife in their most natural state.",
  mosaic: [
    {
      src: "/homepageimages/experience-guided-trails.webp",
      alt: "Hikers walking along a forest trail with lush greenery",
    },
    {
      src: "/homepageimages/forest-slide-trails-bg.webp",
      alt: "Rainforest trail through dense canopy",
    },
    {
      src: "/forestpageimages/wildlife.webp",
      alt: "Wildlife in the Sinharaja rainforest",
    },
  ] as const satisfies readonly ExperiencesImage[],
  features: [
    "Endemic Wildlife",
    "Unesco Border",
    "Expert Tracking",
  ] as const,
} as const;

export const EXPERIENCES_WATERFALL = {
  headline: "Forest Bathing By Private Waterfalls",
  body: "Immerse yourself in secluded natural spring pools fed by our private cascading waterfalls. It is a restorative sanctuary where the only sound is the flow of pure, unhurried water.",
  label: "Spring-fed natural pool",
  image: {
    src: "/homepageimages/experience-waterfall-pools.webp",
    alt: "Cascading waterfall over dark rocks surrounded by lush rainforest",
  } satisfies ExperiencesImage,
} as const;

export const EXPERIENCES_DINING = {
  headline: "Bespoke Dining Prepared by a Private Chef.",
  body: "Savor hyper-local ingredients and estate-harvested produce, transformed into tailored menus by your private chef. Every meal is a sensory event, served against the atmospheric backdrop of the wild.",
  mosaic: [
    {
      src: "/homepageimages/experience-private-dining.webp",
      alt: "Private chef grilling skewers and corn over an outdoor barbecue",
    },
    {
      src: "/homepageimages/villa-gallery-dining-room.webp",
      alt: "Dining area overlooking the rainforest",
    },
    {
      src: "/homepageimages/villa-gallery-indoor-outdoor.webp",
      alt: "Indoor-outdoor dining at the estate",
    },
  ] as const satisfies readonly ExperiencesImage[],
  features: [
    "Tailored Menus",
    "Local Ingredients",
    "Estate Harvest",
  ] as const,
} as const;

export const EXPERIENCES_CTA = {
  eyebrow: "The Estate Promise",
  buttonLabel: "Check Availability",
  bgSrc: "/homepageimages/cta-bg.webp",
} as const;
