/**
 * Idempotent seed: upserts leftover gallery WebPs from public/others/
 * into MongoDB. Matched by filename — inserts new docs or refreshes
 * binary + alt on existing ones.
 *
 * Usage: npm run seed:gallery
 */
const fs = require("fs");
const path = require("path");
const { MongoClient, Binary } = require("mongodb");

// Load .env.local / .env if present (Next.js style, no dotenv dependency).
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));
loadEnvFile(path.join(__dirname, "..", ".env"));

const SEED_IMAGES = [
  {
    filename: "0C8A0033.webp",
    alt: "Night pavilion with fairy lights, chandeliers, and a glowing moon wall",
    order: 0,
  },
  {
    filename: "0C8A9867.webp",
    alt: "Warmly lit guest bedroom with twin beds and tufted headboards",
    order: 1,
  },
  {
    filename: "0C8A9902.webp",
    alt: "Sage-green twin bedroom with wooden headboards and tulip artwork",
    order: 2,
  },
  {
    filename: "0C8A9996.webp",
    alt: "Dusk terrace overlooking the forest, with a circular chandelier and estate sign",
    order: 3,
  },
  {
    filename: "0C8A9920.webp",
    alt: "Open-plan dining, living, and bar area looking out to the forest",
    order: 4,
  },
  {
    filename: "0C8A9945.webp",
    alt: "Terracotta guest bedroom with pendant lights and a forest balcony",
    order: 5,
  },
  {
    filename: "0C8A9948.webp",
    alt: "Twin bedroom with terracotta quilts, pendant lights, and a hillside view",
    order: 6,
  },
  {
    filename: "0C8A0040.webp",
    alt: "Daytime stone-clad villa exterior with palms and a retaining wall",
    order: 7,
  },
  {
    filename: "0C8A0065.webp",
    alt: "Garden lawn with a wooden swing and white patio furniture",
    order: 8,
  },
  {
    filename: "0C8A0069.webp",
    alt: "Afternoon tea and snacks on a rock overlooking the waterfall",
    order: 9,
  },
  {
    filename: "0C8A0072.webp",
    alt: "Rectangular pool with lounge chairs, umbrellas, and the villa beyond",
    order: 10,
  },
  {
    filename: "0C8A0084.webp",
    alt: "Infinity pool and rock waterfall with misty hills",
    order: 11,
  },
  {
    filename: "0C8A0088.webp",
    alt: "Rock waterfall cascading into the dark pool",
    order: 12,
  },
  {
    filename: "0C8A9924.webp",
    alt: "Twilight villa exterior with lit windows and a paved courtyard",
    order: 13,
  },
  {
    filename: "DSC_0456.webp",
    alt: "Pool, waterfall, and lounge umbrellas against the forest",
    order: 14,
  },
  {
    filename: "DSC_0469.webp",
    alt: "Wide pool and waterfall view toward misty mountains",
    order: 15,
  },
  {
    filename: "DSC_0477.webp",
    alt: "Pavilion dining with the glowing moon wall and forest beyond",
    order: 16,
  },
  {
    filename: "DSC_0483.webp",
    alt: "Infinity pool, waterfall, and hillside estate sign",
    order: 17,
  },
  {
    filename: "DSC_0642.webp",
    alt: "Tea poured from a black teapot at an outdoor table",
    order: 18,
  },
  {
    filename: "DSC_0664_1.webp",
    alt: "Poolside waterfall with lounge chairs and green umbrellas",
    order: 19,
  },
  {
    filename: "0C8A0159.webp",
    alt: "Guests gathered by the rock waterfall and pool on the estate lawn",
    order: 20,
  },
  {
    filename: "0C8A0176.webp",
    alt: "Family sitting on the wooden garden swing with citrus fruit",
    order: 21,
  },
  {
    filename: "0C8A0194.webp",
    alt: "Guests seated on the stone ledge in front of the waterfall",
    order: 22,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI. Set it in .env.local or the environment.");
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB || "thambalagama_estate";
  const imagesDir = path.join(__dirname, "..", "public", "others");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const collection = client.db(dbName).collection("gallery_images");

    await Promise.all([
      collection.createIndex({ order: 1 }),
      collection.createIndex({ createdAt: -1 }),
      collection.createIndex({ filename: 1 }),
    ]);

    let inserted = 0;
    let updated = 0;

    for (const item of SEED_IMAGES) {
      const filePath = path.join(imagesDir, item.filename);
      if (!fs.existsSync(filePath)) {
        console.error(`missing file: ${filePath}`);
        process.exit(1);
      }

      const buffer = fs.readFileSync(filePath);
      const now = new Date();
      const existing = await collection.findOne({ filename: item.filename });

      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          {
            $set: {
              alt: item.alt,
              mimeType: "image/webp",
              order: item.order,
              data: new Binary(buffer),
              updatedAt: now,
            },
          },
        );
        console.log(`update ${item.filename}`);
        updated += 1;
        continue;
      }

      await collection.insertOne({
        alt: item.alt,
        mimeType: "image/webp",
        filename: item.filename,
        order: item.order,
        data: new Binary(buffer),
        createdAt: now,
        updatedAt: now,
      });

      console.log(`ok     ${item.filename}`);
      inserted += 1;
    }

    console.log(`\nDone. inserted=${inserted} updated=${updated}`);

    const movedToStatic = ["0C8A9912.webp"];
    for (const filename of movedToStatic) {
      const result = await collection.deleteOne({ filename });
      if (result.deletedCount) {
        console.log(`removed ${filename} (now in first 9)`);
      }
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
