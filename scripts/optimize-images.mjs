/**
 * One-off (re-runnable) image optimizer for public marketing assets.
 * - Resizes oversized sources
 * - Re-encodes WebP in place when beneficial
 * - Converts JPG/JPEG under content folders to WebP and removes originals
 *
 * Usage: node scripts/optimize-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public");

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".WEBP",
]);

/** Folders where JPG/PNG should become WebP (not logos / icons). */
const CONVERT_DIRS = new Set([
  "home",
  "bungalow",
  "gallery",
  "forest",
  "experiences",
]);

function maxWidthFor(relPosix) {
  const base = path.posix.basename(relPosix).toLowerCase();
  if (
    base.includes("hero") ||
    base.includes("cta-bg") ||
    base.includes("villa-bg") ||
    base.includes("forest-slide")
  ) {
    return 1920;
  }
  if (relPosix.includes("/gallery/") || base.includes("gallery")) {
    return 1600;
  }
  if (
    base.includes("cloud") ||
    base.includes("mosaic") ||
    base.includes("accent")
  ) {
    return 1200;
  }
  return 1600;
}

function qualityFor(relPosix) {
  if (relPosix.includes("/gallery/")) return 72;
  const base = path.posix.basename(relPosix).toLowerCase();
  if (base.includes("hero")) return 72;
  return 75;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (IMAGE_EXT.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function toPosix(rel) {
  return rel.split(path.sep).join("/");
}

async function optimizeFile(fullPath) {
  const rel = toPosix(path.relative(ROOT, fullPath));
  const ext = path.extname(fullPath);
  const extLower = ext.toLowerCase();
  const topDir = rel.split("/")[0];
  const before = (await fs.stat(fullPath)).size;

  // Keep small logo PNGs as-is (email + header).
  if (topDir === "logo" || topDir === "icons") {
    return { rel, skipped: true, reason: "logo" };
  }

  const maxWidth = maxWidthFor(rel);
  const quality = qualityFor(rel);
  const shouldConvert =
    CONVERT_DIRS.has(topDir) &&
    (extLower === ".jpg" || extLower === ".jpeg" || extLower === ".png");

  // Read into memory first so Windows can overwrite the source path.
  const input = await fs.readFile(fullPath);
  const pipeline = sharp(input, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? 0;
  const resize =
    width > maxWidth
      ? pipeline.resize({
          width: maxWidth,
          withoutEnlargement: true,
        })
      : pipeline;

  async function writeAtomic(destPath, buf) {
    const tmp = `${destPath}.${process.pid}.tmp.webp`;
    await fs.writeFile(tmp, buf);
    await fs.rename(tmp, destPath).catch(async () => {
      // Windows: replace locked path via unlink + rename.
      await fs.unlink(destPath).catch(() => {});
      await fs.rename(tmp, destPath);
    });
  }

  if (shouldConvert) {
    const outPath = fullPath.replace(/\.(jpe?g|png|JPE?G|PNG)$/, ".webp");
    const outRel = toPosix(path.relative(ROOT, outPath));
    const buf = await resize.webp({ quality, effort: 4 }).toBuffer();
    await writeAtomic(outPath, buf);
    if (path.resolve(outPath) !== path.resolve(fullPath)) {
      await fs.unlink(fullPath);
    }
    const after = buf.length;
    return {
      rel,
      outRel,
      before,
      after,
      converted: true,
    };
  }

  // Re-encode WebP (and any leftover raster) in place when we can shrink.
  if (extLower === ".webp") {
    const buf = await resize.webp({ quality, effort: 4 }).toBuffer();
    if (buf.length < before * 0.98 || width > maxWidth) {
      await writeAtomic(fullPath, buf);
      return {
        rel,
        before,
        after: buf.length,
        recompressed: buf.length < before * 0.98,
        resized: width > maxWidth,
      };
    }
    return { rel, skipped: true, reason: "already-small", before };
  }

  return { rel, skipped: true, reason: "unsupported-ext" };
}

async function main() {
  const files = await walk(ROOT);
  const results = [];
  for (const file of files) {
    try {
      results.push(await optimizeFile(file));
    } catch (err) {
      results.push({
        rel: toPosix(path.relative(ROOT, file)),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const changed = results.filter((r) => r.converted || r.recompressed || r.resized);
  const errors = results.filter((r) => r.error);
  let saved = 0;
  for (const r of changed) {
    if (typeof r.before === "number" && typeof r.after === "number") {
      saved += r.before - r.after;
    }
  }

  console.log(`Processed ${files.length} images`);
  console.log(`Changed ${changed.length} (saved ~${(saved / 1024 / 1024).toFixed(1)} MB)`);
  for (const r of changed) {
    const from = ((r.before ?? 0) / 1024).toFixed(0);
    const to = ((r.after ?? 0) / 1024).toFixed(0);
    const label = r.converted
      ? `CONVERT ${r.rel} -> ${r.outRel}`
      : `UPDATE ${r.rel}`;
    console.log(`  ${label}: ${from}KB -> ${to}KB`);
  }
  if (errors.length) {
    console.error(`\n${errors.length} errors:`);
    for (const r of errors) console.error(`  ${r.rel}: ${r.error}`);
    process.exitCode = 1;
  }
}

main();
