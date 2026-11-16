import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { expandStayNights } from "@/lib/bookings/dates";

const ensureValidRange: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data;

  const start = data.start;
  const end = data.end;
  if (typeof start !== "string" || typeof end !== "string") {
    throw new Error("Start and end dates are required (YYYY-MM-DD).");
  }

  if (expandStayNights(start, end).length === 0) {
    throw new Error(
      "End must be after start so at least one night is blocked.",
    );
  }

  return data;
};

export const DateBlocks: CollectionConfig = {
  slug: "date-blocks",
  dbName: "date-blocks",
  labels: {
    singular: "Date Block",
    plural: "Date Blocks",
  },
  defaultSort: "start",
  admin: {
    // Hidden from nav — owners manage blocks on the Estate dashboard calendar.
    hidden: true,
    useAsTitle: "start",
    defaultColumns: ["start", "end", "note", "updatedAt"],
    description:
      "Manual closures stored for the website booking calendar. Manage via the Estate dashboard Block dates calendar.",
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [ensureValidRange],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "start",
          type: "text",
          required: true,
          admin: {
            width: "50%",
            description: "First blocked night (YYYY-MM-DD, inclusive)",
          },
        },
        {
          name: "end",
          type: "text",
          required: true,
          admin: {
            width: "50%",
            description:
              "Morning after last blocked night (YYYY-MM-DD, exclusive)",
          },
        },
      ],
    },
    {
      name: "note",
      type: "text",
      maxLength: 200,
      admin: {
        description: "Optional reason (e.g. Owner visit)",
      },
    },
  ],
  timestamps: true,
};
