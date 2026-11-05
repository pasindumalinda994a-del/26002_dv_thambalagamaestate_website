import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Bookings } from "./collections/Bookings";
import { GalleryImages } from "./collections/GalleryImages";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
  },
  // Estate group first in nav, then Account (Users).
  collections: [Bookings, GalleryImages, Users],
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
  sharp,
});
