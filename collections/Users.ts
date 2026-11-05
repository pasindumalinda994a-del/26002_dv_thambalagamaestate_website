import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "User",
    plural: "Users",
  },
  admin: {
    useAsTitle: "email",
    group: "Account",
    defaultColumns: ["name", "email", "updatedAt"],
    description: "People who can sign in to this CMS.",
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
      required: false,
      admin: {
        description: "Display name shown in the team list.",
      },
    },
  ],
};
