/**
 * Idempotent seed: inserts gallery images 10–14 from public/main images/
 * into MongoDB. Skips files that already exist (matched by filename).
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
    filename: "Villa Image 4.webp",
    alt: "Villa terrace",
    order: 0,
  },
  {
    filename: "Forest Section Bg 3.webp",
    alt: "Deep forest",
    order: 1,
  },
  {
    filename: "Experience Image 6.webp",
    alt: "Forest experience",
    order: 2,
  },
  {
    filename: "Start Experience BG.webp",
    alt: "Morning on the estate",
    order: 3,
  },
  {
    filename: "Villa Image 2.webp",
    alt: "Villa living space",
    order: 4,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI. Set it in .env.local or the environment.");
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB || "thambalagama_estate";
  const imagesDir = path.join(__dirname, "..", "public", "main images");
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
    let skipped = 0;

    for (const item of SEED_IMAGES) {
      const existing = await collection.findOne({ filename: item.filename });
      if (existing) {
        console.log(`skip  ${item.filename} (already seeded)`);
        skipped += 1;
        continue;
      }

      const filePath = path.join(imagesDir, item.filename);
      if (!fs.existsSync(filePath)) {
        console.error(`missing file: ${filePath}`);
        process.exit(1);
      }

      const buffer = fs.readFileSync(filePath);
      const now = new Date();

      await collection.insertOne({
        alt: item.alt,
        mimeType: "image/webp",
        filename: item.filename,
        order: item.order,
        data: new Binary(buffer),
        createdAt: now,
        updatedAt: now,
      });

      console.log(`ok    ${item.filename}`);
      inserted += 1;
    }

    console.log(`\nDone. inserted=${inserted} skipped=${skipped}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
