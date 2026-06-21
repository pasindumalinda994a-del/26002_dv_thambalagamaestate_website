const fs = require("fs");
const path = require("path");

const source = path.join(
  __dirname,
  "..",
  "node_modules",
  "mapbox-gl",
  "dist",
  "mapbox-gl-csp-worker.js",
);
const destination = path.join(
  __dirname,
  "..",
  "public",
  "mapbox-gl-csp-worker.js",
);

if (!fs.existsSync(source)) {
  console.warn("copy-mapbox-worker: mapbox-gl worker not found, skipping.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
