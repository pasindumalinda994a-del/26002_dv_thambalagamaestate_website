import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Bookings } from "./collections/Bookings";
import { DateBlocks } from "./collections/DateBlocks";
import { GalleryImages } from "./collections/GalleryImages";
import { Users } from "./collections/Users";
import { ensureDevAdminUser } from "./lib/dev-admin";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isDev = process.env.NODE_ENV === "development";
const devAdminEmail = process.env.DEV_ADMIN_EMAIL?.trim();
const devAdminPassword = process.env.DEV_ADMIN_PASSWORD;
const mongoUri = process.env.MONGODB_URI || "";
const mongoIsLocal = /127\.0\.0\.1|localhost/i.test(mongoUri);
const mongoKind = mongoIsLocal
  ? "localhost"
  : /mongodb\.net|atlas/i.test(mongoUri)
    ? "atlas"
    : "other";
// Prefill only for local Mongo — never against shared/Atlas DBs from a local machine.
const autoLoginEnabled = Boolean(
  isDev && !process.env.VERCEL && mongoIsLocal && devAdminEmail && devAdminPassword,
);

// #region agent log
fetch("http://127.0.0.1:7762/ingest/1c6b5b1c-5a13-45bc-8a7f-ee2475d97cd6", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "9038dd",
  },
  body: JSON.stringify({
    sessionId: "9038dd",
    runId: "post-fix",
    hypothesisId: "C",
    location: "payload.config.ts:autoLogin",
    message: "autoLogin config evaluated",
    data: {
      nodeEnv: process.env.NODE_ENV ?? null,
      isDev,
      vercelSet: Boolean(process.env.VERCEL),
      hasDevEmail: Boolean(devAdminEmail),
      hasDevPassword: Boolean(devAdminPassword),
      mongoKind,
      mongoIsLocal,
      autoLoginEnabled,
      prefillOnly: true,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " — Thambalagama Estate",
      icons: [
        {
          rel: "icon",
          type: "image/png",
          url: "/logo/favicon.png",
        },
      ],
    },
    components: {
      graphics: {
        Icon: "/components/payload/AdminIcon#AdminIcon",
        Logo: "/components/payload/AdminLogo#AdminLogo",
      },
      beforeNavLinks: [
        "/components/payload/DashboardNavLink#DashboardNavLink",
      ],
      views: {
        dashboard: {
          Component: "/components/payload/EstateDashboard#EstateDashboard",
        },
      },
    },
    // Prefill local login only; production never gets autoLogin.
    autoLogin: autoLoginEnabled
      ? {
          email: devAdminEmail!,
          password: devAdminPassword!,
          prefillOnly: true,
        }
      : false,
  },
  // Estate group first in nav, then Account (Users).
  collections: [Bookings, DateBlocks, GalleryImages, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
    connectOptions: {
      dbName: process.env.MONGODB_DB || "thambalagama_estate",
    },
    autoPluralization: false,
  }),
  onInit: async (payload) => {
    await ensureDevAdminUser(payload);
  },
  sharp,
  plugins: [
    vercelBlobStorage({
      // No token locally: plugin stays off and uploads stay in media/gallery.
      // On Vercel, BLOB_READ_WRITE_TOKEN is set when a Blob store is connected.
      collections: {
        "gallery-images": {
          // Public blob URL on the document, so the gallery does not proxy
          // every photo through a serverless function.
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Vercel rejects request bodies over 4.5MB. Gallery files may be 5MB.
      clientUploads: true,
    }),
  ],
});
