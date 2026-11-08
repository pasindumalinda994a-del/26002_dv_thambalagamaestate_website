/**
 * Upload existing media/gallery files into the Vercel Blob store.
 *
 * Payload looks them up by filename at the store root, so the pathname
 * must stay the filename (no random suffix).
 *
 * Usage: set BLOB_READ_WRITE_TOKEN in .env.local, then
 *   npm run upload:gallery-blobs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const galleryDir = path.join(root, "media", "gallery");

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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN. Connect a Blob store on the Vercel project, copy the token into .env.local, then run this again.",
  );
  process.exit(1);
}

if (!fs.existsSync(galleryDir)) {
  console.error(`No local gallery directory at ${galleryDir}`);
  process.exit(1);
}

const files = fs
  .readdirSync(galleryDir)
  .filter((name) => MIME_BY_EXT[path.extname(name).toLowerCase()]);

let uploaded = 0;
for (const filename of files) {
  const filePath = path.join(galleryDir, filename);
  const body = await fs.openAsBlob(filePath);
  const result = await put(filename, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: MIME_BY_EXT[path.extname(filename).toLowerCase()],
    token,
  });
  uploaded += 1;
  console.log(`uploaded: ${filename} -> ${result.url}`);
}

console.log(`Done. uploaded=${uploaded}`);
