/**
 * One-time migration: Binary `gallery_images` → Payload `gallery-images` uploads.
 *
 * Usage: npm run migrate:gallery
 *
 * Re-run safe: skips filenames already present in gallery-images.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { getPayload } from "payload";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath: string) {
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

// Must load env before importing payload.config (it reads PAYLOAD_SECRET at eval time).
loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error(
      "Missing PAYLOAD_SECRET — add it to .env.local before migrating",
    );
  }

  const { default: config } = await import("../payload.config");

  const dbName = process.env.MONGODB_DB || "thambalagama_estate";
  const client = new MongoClient(uri);
  await client.connect();
  const legacy = client.db(dbName).collection("gallery_images");
  const docs = await legacy.find({}).sort({ order: 1, createdAt: 1 }).toArray();
  console.log(`Found ${docs.length} legacy gallery_images document(s)`);

  const payload = await getPayload({ config });

  let created = 0;
  let skipped = 0;

  for (const doc of docs) {
    const filename =
      (typeof doc.filename === "string" && doc.filename) ||
      `gallery-${String(doc._id)}.webp`;

    const existing = await payload.find({
      collection: "gallery-images",
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      skipped += 1;
      console.log(`skip (exists): ${filename}`);
      continue;
    }

    const raw = doc.data;
    const buffer = Buffer.from(
      raw?.buffer ? raw.buffer : raw,
    );

    await payload.create({
      collection: "gallery-images",
      data: {
        alt: (typeof doc.alt === "string" && doc.alt) || filename,
        order: typeof doc.order === "number" ? doc.order : created,
      },
      file: {
        data: buffer,
        mimetype:
          (typeof doc.mimeType === "string" && doc.mimeType) || "image/webp",
        name: filename,
        size: buffer.length,
      },
      overrideAccess: true,
    });

    created += 1;
    console.log(`migrated: ${filename}`);
  }

  await client.close();
  console.log(`Done. created=${created} skipped=${skipped}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
