import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const GalleryImages: CollectionConfig = {
  slug: "gallery-images",
  dbName: "gallery-images",
  labels: {
    singular: "Gallery Image",
    plural: "Gallery Images",
  },
  admin: {
    group: "Estate",
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "order", "updatedAt"],
    defaultSort: "order",
    description:
      "Extra gallery photos shown after the static homepage set on /gallery.",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: path.resolve(dirname, "../media/gallery"),
    mimeTypes: ["image/webp", "image/jpeg", "image/png"],
    imageSizes: [],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      maxLength: 200,
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first.",
      },
    },
  ],
  timestamps: true,
};
