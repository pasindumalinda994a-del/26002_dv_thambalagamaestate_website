export const FOREST_HERO = {
  headline:
    "The complete guide to Sri Lanka's last primary rainforest — entrances, wildlife, hiking, and where to base yourself.",
  meta: [
    { label: "read time", value: "15 min" },
    { label: "updated", value: "2026" },
    { label: "elevation", value: "300–1,170m" },
    { label: "Reserve area", value: "8,900 ha" },
  ],
  heroImage: {
    src: "/forestpageimages/forest-hero.webp",
    alt: "Aerial view of dense tropical rainforest with a river and waterfall",
  },
  introLead:
    "If you've spent any time researching a Sri Lanka holiday, you've probably come across the name Sinharaja more than once. It shows up in the same breath as Sigiriya and Yala, but it's a completely different kind of experience. There's no big rock to climb and no jeep full of tourists chasing a leopard. It's just forest, and a lot of it.",
  introSupport:
    "I want to walk you through everything you'd actually need to know before showing up, from which entrance to pick to what to pack in your bag so the leeches don't ruin your day. Let's get into it.",
} as const;

export type TocItem = {
  id: string;
  label: string;
};

export const FOREST_TOC: TocItem[] = [
  { id: "why-visit", label: "Why visit Sinharaja" },
  { id: "what-makes-unique", label: "What makes it unique" },
  { id: "where-is", label: "Where is Sinharaja" },
  { id: "how-to-get", label: "How to get ther" },
  { id: "choosing-entrance", label: "Choosing an entrance" },
  { id: "best-time", label: "Best time to visit" },
  { id: "things-to-do", label: "Things to do" },
  { id: "wildlife", label: "Wildlife you'll see" },
  { id: "trekking", label: "Trekking guide" },
  { id: "what-to-pack", label: "What to pack" },
  { id: "where-to-stay", label: "Where to stay" },
  { id: "itinerary-2-day", label: "2-day itinerary" },
  { id: "itinerary-3-day", label: "3-day itinerary" },
  { id: "travel-tips", label: "Travel tips" },
  { id: "faq", label: "FAQ" },
];

export type RichBlock = {
  type: "paragraph";
  text: string;
};

export type QuoteBlock = {
  type: "quote";
  text: string;
};

export type ImageBlock = {
  type: "image";
  src: string;
  alt: string;
};

export type TitleCardsBlock = {
  type: "titleCards";
  cards: { title: string; content: string }[];
};

export type TableBlock = {
  type: "table";
  headers: [string, string, string, string];
  rows: [string, string, string, string][];
};

export type BulletsBlock = {
  type: "bullets";
  items: string[];
};

export type NumberCardsBlock = {
  type: "numberCards";
  cards: { number: string; sub: string; text: string }[];
};

export type ButtonBlock = {
  type: "button";
  label: string;
  href: string;
};

export type FaqBlock = {
  type: "faq";
  items: { question: string; answer: string }[];
};

export type ContentBlock =
  | RichBlock
  | QuoteBlock
  | ImageBlock
  | TitleCardsBlock
  | TableBlock
  | BulletsBlock
  | NumberCardsBlock
  | ButtonBlock
  | FaqBlock;

export type GuideSection = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

export const FOREST_SECTIONS: GuideSection[] = [
  {
    id: "why-visit",
    title: "Why Visit Sinharaja Forest?",
    blocks: [
      {
        type: "paragraph",
        text: "Sri Lanka lost most of its lowland rainforest to agriculture and tea cultivation over the last two centuries. Sinharaja is what's left. It's the country's last viable stretch of primary tropical rainforest, and that single fact explains why it carries so much weight with scientists, birders, and anyone who cares about what an untouched ecosystem actually looks like.",
      },
      {
        type: "quote",
        text: '"You won\'t see elephants crashing through the undergrowth. What you get instead is quieter, and more interesting if you slow down for it."',
      },
      {
        type: "paragraph",
        text: "Towering hardwood trees, a canopy so thick that midday light barely reaches the forest floor, and the constant background hum of insects and birds you can hear long before you spot them.\n\nFor travelers building a Sri Lanka holiday around nature and eco tourism rather than beaches and temples, Sinharaja is close to essential. It's also a good counterbalance if your trip already includes Yala or Udawalawe, since it shows you a completely different side of the island's wildlife.",
      },
      {
        type: "image",
        src: "/forestpageimages/why-visit.webp",
        alt: "Moss-covered tree branch in a dense, shaded rainforest",
      },
    ],
  },
  {
    id: "what-makes-unique",
    title: "What Makes Sinharaja One of Sri Lanka's Most Unique Destinations?",
    blocks: [
      {
        type: "paragraph",
        text: "Sinharaja was declared a forest reserve back in 1875, made a UNESCO Biosphere Reserve in 1978, and inscribed as a UNESCO World Heritage Site in 1988. That last part matters. It puts Sinharaja in the same conservation category as places like the Galápagos, which tells you something about how seriously the scientific community takes this patch of forest.\n\nThe numbers back it up too. More than 60% of the trees here are endemic, meaning they grow naturally nowhere else on earth. The reserve holds over 50% of Sri Lanka's endemic mammal and butterfly species, and it's home to the vast majority of the island's endemic birds. Some studies put endemism among certain tree families at over 90%.\n\nWhat that means for you as a visitor is simple. Walk any trail here with a decent guide, and you're almost guaranteed to see something that exists in exactly one place on the planet. That's a rare thing to be able to say about a half-day hike.",
      },
      {
        type: "image",
        src: "/forestpageimages/what-makes-unique.webp",
        alt: "Colorful forest bird perched on a branch",
      },
    ],
  },
  {
    id: "where-is",
    title: "Where is Sinharaja Forest?",
    blocks: [
      {
        type: "paragraph",
        text: "Sinharaja sits in the southwest lowland wet zone of Sri Lanka, spread across the Sabaragamuwa, Southern, and parts of the Galle and Matara districts. The reserve covers roughly 8,900 hectares (about 89 square kilometers), stretching across a series of ridges and valleys at elevations between 300 and 1,170 meters.\n\nIt's bordered by rivers on almost every side, which is partly why the place stays so wet and so wild. The Gin River runs along the southern edge, while the Kalu River catches drainage from the north through a network of smaller streams. If you're picturing the shape of Sri Lanka in your head, Sinharaja sits inland from Galle and Matara, roughly two to four hours from Colombo depending on which entrance you're aiming for.",
      },
    ],
  },
  {
    id: "how-to-get",
    title: "How to Get to Sinharaja",
    blocks: [
      {
        type: "paragraph",
        text: "Getting here takes a bit of planning. There's no train station nearby, bus connections are limited and slow, and the final stretch of road to most entrances is narrow and bumpy. A private car or a pre-arranged transfer is genuinely the way to go, especially if you're short on time.",
      },
      {
        type: "titleCards",
        cards: [
          {
            title: "from colombo",
            content:
              "Via Ratnapura to Kudawa, roughly 3–4 hours. Southern entrances run via the Southern Expressway toward Deniyaya, similar duration.",
          },
          {
            title: "From Galle",
            content:
              "Around 2–2.5 hours to Deniyaya, the gateway town for Pitadeniya and Lankagama.",
          },
          {
            title: "From Mirissa",
            content:
              "About 2.5 hours to Deniyaya — a realistic day trip or overnight add-on from the south coast.",
          },
          {
            title: "From Ella",
            content:
              "The longer haul, 4–5 hours depending on route and road conditions. Treat it as a travel day.",
          },
          {
            title: "From the Airport",
            content:
              "Budget 4–5 hours to the southern entrances, or 3–4 hours toward Kudawa. Arrive in daylight if you can.",
          },
        ],
      },
    ],
  },
  {
    id: "choosing-entrance",
    title: "Which Sinharaja Entrance Should You Choose?",
    blocks: [
      {
        type: "paragraph",
        text: "This is probably the single most useful decision you'll make when planning your visit, and it's the one most guides skip over. Sinharaja has several access points, and they genuinely offer different experiences.\n\n**Kudawa**, on the northwestern boundary near Weddagala, is the most established and best-maintained entrance. It's the classic choice for birdwatchers and butterfly spotters, and it gives you access to the two most famous trails in the reserve: Moulawella Peak and Sinhagala.\n\n**Lankagama**, approached through Deniyaya on the southern side, is the waterfall lover's entrance. You can reach several waterfalls within a few hours of walking, and there's a decent chance of spotting purple-faced langurs in this section. The road in can be rough, so a 4WD helps.\n\n**Pitadeniya**, also near Deniyaya, is one of the oldest and most active entrances. It's known for Kekuna Ella and Pathan Oya waterfalls, a hanging bridge at the conservation center, and relatively flat terrain that's kinder on the knees.\n\n**Neluwa** offers access from the southwest via Hiniduma, and it's a quieter route if you want to avoid the crowds at Kudawa or Pitadeniya on weekends.\n\n**Rakwana**, also known as the Morningside entrance, sits at higher elevation on the eastern side. This one leans into montane forest character rather than pure lowland rainforest, and it's a solid pick for cooler hikes and different bird species than you'd find lower down.",
      },
      {
        type: "table",
        headers: ["entrance", "best for", "nearest town", "terrain"],
        rows: [
          [
            "Kudawa",
            "Birdwatching, established trails",
            "Weddagala",
            "Moderate, well-marked",
          ],
          [
            "Lankagama",
            "Waterfalls, langurs",
            "Deniyaya",
            "Rougher access road",
          ],
          [
            "pitadeniya",
            "Waterfalls, easier walking",
            "Deniyaya / Mederipitiya",
            "Relatively flat",
          ],
          ["neluwa", "Fewer crowds", "Hiniduma", "Moderate"],
          [
            "rakwana",
            "Cooler climate, montane species",
            "Rakwana",
            "Higher elevation, steeper",
          ],
        ],
      },
      {
        type: "paragraph",
        text: "If this is your first visit and photography or birding is the priority, Kudawa is the safe bet. If waterfalls and a quieter trail matter more to you, Lankagama or Pitadeniya are worth the rougher drive.",
      },
    ],
  },
  {
    id: "best-time",
    title: "Best Time to Visit Sinharaja",
    blocks: [
      {
        type: "paragraph",
        text: "Sinharaja is a rainforest, so let's be honest from the start: it rains here a lot, and that's kind of the point. Annual rainfall runs anywhere from about 3,600mm to over 5,000mm, so packing a rain jacket isn't optional, it's basically mandatory year round.\n\nThat said, some months are noticeably drier and more pleasant for hiking than others.\n\n**Monthly weather:** The driest stretches typically fall between January and April, and again briefly in August. Average temperatures hover between 19°C and 34°C depending on elevation, staying warm and humid throughout the year.\n\n**Rainfall:** Sinharaja receives two monsoons, since it sits in the wet zone that catches both the southwest monsoon (roughly May to September) and some of the northeast monsoon influence later in the year. Expect short, heavy downpours rather than all-day drizzle.\n\n**Wildlife seasons:** Wildlife activity stays fairly consistent year round because the forest never really dries out. That said, drier months make trails easier to walk and reduce (though never eliminate) leech encounters.\n\n**Bird watching season:** Resident endemic birds are visible throughout the year, but the drier months from January to April tend to offer clearer viewing conditions and easier trail access for longer birding walks.\n\n**Photography season:** If misty, moody rainforest shots are what you're after, the wetter months actually deliver better atmosphere. If you'd rather keep your camera gear dry and get sharper wildlife shots, aim for the January to April window instead.",
      },
    ],
  },
  {
    id: "things-to-do",
    title: "Things to Do in Sinharaja Forest",
    blocks: [
      {
        type: "paragraph",
        text: "**Guided trekking** is the main event here, and it's mandatory anyway since independent hiking isn't permitted inside the reserve. Trails range from an easy 90-minute loop to full-day treks toward Sinhagala peak.\n\n**Bird watching** draws a serious crowd of dedicated birders every year, and for good reason. Sinharaja holds the highest concentration of Sri Lanka's endemic bird species anywhere on the island.\n\n**Wildlife photography** rewards patience more than expensive gear. A guide who knows where the mixed feeding flocks tend to move will get you far better shots than wandering alone ever could.\n\n**Waterfalls** scattered around the Lankagama and Pitadeniya entrances make for a natural reward at the end of a sweaty hike, whether you're there to photograph them or just cool off.\n\n**Swimming** is possible in some of the calmer pools below the waterfalls, though always check with your guide first since water levels shift quickly after rain.\n\n**Nature walks** on the gentler trails suit families or anyone not up for a full trek. Even a short walk from Kudawa's conservation center delivers a solid taste of the forest.\n\n**Village experiences** around Kudawa and Deniyaya offer a look at how local communities have lived alongside the reserve for generations, often through small guesthouses run by families with deep knowledge of the forest.",
      },
      {
        type: "image",
        src: "/forestpageimages/things-to-do.webp",
        alt: "Hikers walking single-file along a narrow trail through dense rainforest",
      },
    ],
  },
  {
    id: "wildlife",
    title: "Wildlife You'll See",
    blocks: [
      {
        type: "paragraph",
        text: "**Birds** are the headline act. Keep an eye out for the Sri Lanka blue magpie, red-faced malkoha, green-billed coucal, Sri Lanka frogmouth, and the Sri Lanka grey hornbill. Birds here tend to travel in mixed feeding flocks, often led by the drongo and the orange-billed babbler, so once you spot one species, several more are usually close by.\n\n**Reptiles** in the reserve include green pit vipers, various endemic lizard species, and if you're lucky (or unlucky, depending on your feelings about snakes) the occasional hump-nosed viper.\n\n**Butterflies** flutter through sunlit clearings in impressive numbers and variety, with Sinharaja holding a large share of the island's endemic species.\n\n**Mammals** are harder to spot given the dense canopy, but purple-faced langurs, giant squirrels, and occasionally a fishing cat or two show up for patient or lucky visitors.\n\n**Endemic species** overall are the real draw. Between the birds, mammals, butterflies, and plant life, Sinharaja punches well above its size when it comes to species found nowhere else on the planet.",
      },
      {
        type: "image",
        src: "/forestpageimages/wildlife.webp",
        alt: "Wildlife photographer with a telephoto lens in dense forest foliage",
      },
    ],
  },
  {
    id: "trekking",
    title: "Complete Trekking Guide",
    blocks: [
      {
        type: "paragraph",
        text: "**Difficulty** ranges from easy to genuinely demanding, depending on which trail and entrance you choose. The short loops near Kudawa's conservation center are manageable for most fitness levels, while Sinhagala peak is a serious full-day trek over uneven, often slippery terrain.\n\n**Routes** worth knowing include the Moulawella Nature Trail (moderate, a few hours, good views), the Sinhagala Trail (long, difficult, reaches the highest point in the reserve), and the waterfall circuits around Lankagama and Pitadeniya (moderate, three to five hours with multiple stops).\n\n**Duration** for most day treks runs between three and seven hours. If you want to reach Sinhagala peak, plan for a full day and start early.\n\n**Guide costs** vary by entrance and negotiation, but expect somewhere in the range of a few thousand Sri Lankan rupees for a private guide over a few hours, more for a full-day trek. Prices shift year to year, so confirm current rates locally or through your accommodation before you go.\n\n**Entrance fees** for foreign visitors generally sit somewhere between roughly USD 15 and 20, though this has fluctuated over recent years, so it's worth double-checking before your trip. A registered guide is mandatory and is either included in this fee or charged separately depending on the entrance.\n\n**Safety** inside the reserve is generally good as long as you stick with your guide and wear appropriate footwear. Trails get slippery after rain, streams can rise quickly, and you're deep enough in the forest that a twisted ankle becomes a real inconvenience rather than a minor one.",
      },
      {
        type: "image",
        src: "/forestpageimages/trekking.webp",
        alt: "Dirt trail winding through dense rainforest with wet foliage",
      },
    ],
  },
  {
    id: "what-to-pack",
    title: "What to Pack",
    blocks: [
      {
        type: "bullets",
        items: [
          "Sturdy, closed-toe hiking shoes with good grip",
          "Leech socks, or thick socks tucked into your pants",
          'A lightweight rain jacket, even in the "dry" season',
          "Quick-dry clothing rather than cotton",
          "Insect repellent",
          "A dry bag or waterproof pouch for phone and camera",
          "A refillable water bottle",
          "Binoculars, if birding is a priority",
          "Cash in small denominations",
          "A basic first aid kit for scrapes and leech bites",
        ],
      },
    ],
  },
  {
    id: "where-to-stay",
    title: "Where to Stay Near Sinharaja Forest",
    blocks: [
      {
        type: "paragraph",
        text: "**Budget** travelers will find simple guesthouses and homestays clustered around Kudawa and Deniyaya, often run by families who've guided visitors through the forest for years. Expect basic rooms, home-cooked meals, and genuinely useful local knowledge about the trails.\n\n**Mid-range** hotels and lodges are scattered around the edges of the reserve, offering more comfort, hot water, and sometimes a pool, while still keeping you close enough to reach the trailheads within a short drive.\n\n**Luxury** options are fewer out here compared to somewhere like Kandy or Galle, but a handful of boutique eco-lodges lean into the setting itself, using the forest and mountain views as the main selling point rather than five-star amenities.",
      },
      {
        type: "quote",
        text: "A private villa near Lankagama puts you at the edge of the buffer zone — shorter transfers, quieter mornings, better odds of wildlife from your own porch.",
      },
      {
        type: "paragraph",
        text: "**Private villa near Lankagama** stays are becoming a popular middle ground for travelers who want privacy, space, and direct access to the buffer zone without sacrificing comfort. Staying right at the edge of the reserve near Lankagama means shorter transfer times to the trailhead, quieter mornings before the day-trip crowds arrive, and a much better shot at spotting wildlife right from your own porch. If you're planning more than a quick day visit, this kind of base makes the whole trip feel less rushed.\n\nWherever you stay, book ahead during peak months (January through April), since rooms near the more popular entrances fill up fast.",
      },
      {
        type: "button",
        label: "explore the bungalow",
        href: "/bungalow",
      },
    ],
  },
  {
    id: "itinerary-2-day",
    title: "2-Day Sinharaja Itinerary",
    blocks: [
      {
        type: "numberCards",
        cards: [
          {
            number: "01",
            sub: "Day",
            text: "Travel from Colombo or Galle to your accommodation near Deniyaya or Kudawa, arriving in time to settle in before dark. If your journey allows for it, a short evening walk near your lodge often turns up frogs and nocturnal insects.",
          },
          {
            number: "02",
            sub: "Day",
            text: "Start early, ideally before 7am, for a guided half or full-day trek through your chosen entrance. Aim for one of the waterfall circuits if you're at Lankagama or Pitadeniya, or the Moulawella trail if you're at Kudawa. Head back toward your next destination in the afternoon.",
          },
        ],
      },
    ],
  },
  {
    id: "itinerary-3-day",
    title: "3-Day Nature Holiday Itinerary",
    blocks: [
      {
        type: "numberCards",
        cards: [
          {
            number: "01",
            sub: "Day",
            text: "Arrive and settle in near your entrance of choice. Take it easy, do a short orientation walk, and rest up for the longer hike ahead.",
          },
          {
            number: "02",
            sub: "Day",
            text: "Full-day trek. This is your chance to go for the more demanding routes, like Sinhagala peak from Kudawa or a longer waterfall circuit from Lankagama. Bring a packed lunch since you'll likely be out most of the day.",
          },
          {
            number: "03",
            sub: "Day",
            text: "A slower morning with a shorter, easier walk focused on birdwatching or photography, followed by a relaxed afternoon before heading to your next stop, whether that's the south coast beaches or up toward the hill country.",
          },
        ],
      },
    ],
  },
  {
    id: "travel-tips",
    title: "Travel Tips",
    blocks: [
      {
        type: "paragraph",
        text: "**SIM:** Pick up a local SIM card at the airport or in Colombo before heading out to Sinharaja, since signal gets patchy the closer you get to the forest.\n\n**Cash:** Bring enough Sri Lankan rupees in cash. ATMs and card machines are scarce once you're out of the main towns.\n\n**Weather:** Check the forecast, but don't fully trust it. Rainforest weather changes fast, and a sunny morning can turn into a downpour within the hour.\n\n**Road conditions:** The final few kilometers to most entrances are narrow, unpaved, or both. A vehicle with decent clearance, or a driver who knows the route well, makes a real difference.\n\n**Responsible tourism:** Stick to marked trails, don't feed wildlife, avoid single-use plastics where you can, and always go with a registered guide. Sinharaja survives because of how carefully it's been protected, and that only works if visitors respect the same rules.",
      },
    ],
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    blocks: [
      {
        type: "faq",
        items: [
          {
            question: "Is Sinharaja Forest worth visiting?",
            answer:
              "Yes, especially if you care about wildlife, birding, or simply want to see genuine primary rainforest rather than a manicured nature park. It's a slower, quieter experience than Sri Lanka's more famous parks, which is exactly its appeal.",
          },
          {
            question: "How many days do you need?",
            answer:
              "A single day trek gives you a solid taste of the forest, but two to three days lets you explore more than one trail and increases your odds of good wildlife sightings.",
          },
          {
            question: "Which entrance is best?",
            answer:
              "For a first visit focused on birding or photography, Kudawa is the safest choice. For waterfalls and quieter trails, choose Lankagama or Pitadeniya. Rakwana suits cooler montane hiking, while Neluwa is ideal if you want fewer crowds.",
          },
          {
            question: "Can you visit without a guide?",
            answer:
              "No. Independent hiking is not permitted inside the reserve. A registered guide is mandatory at every entrance and is either included in the entrance fee or charged separately.",
          },
          {
            question: "Is Sinharaja safe?",
            answer:
              "Yes, as long as you stay with your guide and wear proper footwear. Trails can be slippery after rain, streams rise quickly, and you are deep enough in the forest that a twisted ankle becomes a real inconvenience.",
          },
          {
            question: "Are there leeches?",
            answer:
              "Yes — especially in wetter months. Pack leech socks or tuck thick socks into your pants, and bring a basic first aid kit. Drier months reduce encounters but never eliminate them entirely.",
          },
          {
            question: "What animals can you see?",
            answer:
              "Expect endemic birds such as the Sri Lanka blue magpie and red-faced malkoha, plus butterflies, purple-faced langurs, giant squirrels, and occasionally reptiles. Large mammals are harder to spot in the dense canopy.",
          },
          {
            question: "Can children visit?",
            answer:
              "Yes, on gentler nature walks near Kudawa's conservation center or shorter waterfall circuits. Full-day treks like Sinhagala are better suited to older kids and adults with solid fitness.",
          },
          {
            question: "What is the entrance fee?",
            answer:
              "Foreign visitor fees generally sit around USD 15–20, though rates fluctuate. Confirm current prices before your trip. A registered guide is mandatory and may be charged separately depending on the entrance.",
          },
          {
            question: "When is the best time?",
            answer:
              "January to April (and briefly August) are the driest and most comfortable for hiking. The forest is rewarding year-round, but expect rain and more leeches in wetter months.",
          },
          {
            question: "Where should I stay?",
            answer:
              "Stay near your chosen entrance — Kudawa or Deniyaya for convenience. A private villa near Lankagama offers buffer-zone access, quieter mornings, and shorter transfers to southern trailheads.",
          },
          {
            question: "Is Sinharaja suitable for birdwatching?",
            answer:
              "Absolutely. Sinharaja holds the highest concentration of Sri Lanka's endemic bird species. Mixed feeding flocks are common, and the January–April window usually offers the clearest viewing conditions.",
          },
        ],
      },
    ],
  },
  {
    id: "final-thoughts",
    title: "Final Thoughts",
    blocks: [
      {
        type: "paragraph",
        text: "Sinharaja isn't the kind of place that hands you an easy, packaged experience. You'll need a guide, you'll probably get a bit wet, and there's a decent chance a leech or two will find its way onto your sock. But that's exactly why it stays so wild and so worth the effort.\n\nIf you're building a Sri Lanka holiday around genuine nature rather than just checking off famous sights, give this forest more than a rushed afternoon. Pick your entrance based on what you actually want to see, book a base close enough that you're not spending half your trip in transit, and let the forest set the pace. It's one of the few places left on the island that still feels completely untamed.",
      },
    ],
  },
];
