import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";
import {
  expandStayNights,
  staysOverlap,
} from "@/lib/bookings/dates";
import { BOOKING_PURPOSES, BOOKING_STATUSES } from "@/lib/bookings/types";

const purposeOptions = BOOKING_PURPOSES.map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}));

const statusOptions = BOOKING_STATUSES.map((value) => ({
  label:
    value === "new"
      ? "New"
      : value.charAt(0).toUpperCase() + value.slice(1),
  value,
}));

const warnOnConfirmOverlap: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const nextStatus = data?.status;
  const prevStatus = originalDoc?.status;
  const becomingConfirmed =
    nextStatus === "confirmed" &&
    (operation === "create" || prevStatus !== "confirmed");

  if (!becomingConfirmed) return data;

  const checkIn = data?.checkIn ?? originalDoc?.checkIn;
  const checkOut = data?.checkOut ?? originalDoc?.checkOut;
  if (typeof checkIn !== "string" || typeof checkOut !== "string") {
    return data;
  }

  if (expandStayNights(checkIn, checkOut).length === 0) return data;

  try {
    const [stayResult, blockResult] = await Promise.all([
      req.payload.find({
        collection: "bookings",
        where: { status: { equals: "confirmed" } },
        limit: 500,
        depth: 0,
        overrideAccess: true,
        select: {
          fullName: true,
          checkIn: true,
          checkOut: true,
        },
      }),
      req.payload.find({
        collection: "date-blocks",
        limit: 500,
        depth: 0,
        overrideAccess: true,
        select: {
          start: true,
          end: true,
          note: true,
        },
      }),
    ]);

    const excludeId =
      originalDoc?.id != null ? String(originalDoc.id) : undefined;
    const stayOverlaps = stayResult.docs.filter((doc) => {
      if (excludeId && String(doc.id) === excludeId) return false;
      if (typeof doc.checkIn !== "string" || typeof doc.checkOut !== "string") {
        return false;
      }
      return staysOverlap(
        { checkIn, checkOut },
        { checkIn: doc.checkIn, checkOut: doc.checkOut },
      );
    });

    const blockOverlaps = blockResult.docs.filter((doc) => {
      if (typeof doc.start !== "string" || typeof doc.end !== "string") {
        return false;
      }
      return staysOverlap(
        { checkIn, checkOut },
        { checkIn: doc.start, checkOut: doc.end },
      );
    });

    const conflictLabels = [
      ...stayOverlaps.map((doc) =>
        typeof doc.fullName === "string" ? doc.fullName : "Guest",
      ),
      ...blockOverlaps.map((doc) => {
        const note = typeof doc.note === "string" ? doc.note.trim() : "";
        return note || "Manual block";
      }),
    ];

    if (conflictLabels.length > 0) {
      req.payload.logger.warn(
        `Inquiry confirmed with overlapping nights (${checkIn} → ${checkOut}). Conflicts: ${conflictLabels.join(", ")}`,
      );
    }
  } catch (error) {
    req.payload.logger.error({
      msg: "Failed to check confirmed stay overlaps",
      err: error,
    });
  }

  return data;
};

export const Bookings: CollectionConfig = {
  slug: "bookings",
  dbName: "bookings",
  labels: {
    singular: "Inquiry",
    plural: "Inquiries",
  },
  defaultSort: "-createdAt",
  admin: {
    group: "Estate",
    useAsTitle: "fullName",
    defaultColumns: [
      "fullName",
      "email",
      "checkIn",
      "checkOut",
      "status",
      "createdAt",
    ],
    listSearchableFields: ["fullName", "email", "whatsapp"],
    description:
      "Use status filters to triage requests. Confirming blocks nights on the website calendar. Manual closures are managed on the Estate dashboard calendar.",
    components: {
      beforeListTable: [
        "/components/payload/InquiryQuickFilters#InquiryQuickFilters",
      ],
    },
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [warnOnConfirmOverlap],
  },
  fields: [
    {
      name: "stayCalendar",
      type: "ui",
      admin: {
        components: {
          Field: "/components/payload/StayOccupancyField#StayOccupancyField",
        },
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "checkIn",
          type: "text",
          required: true,
          admin: {
            width: "50%",
            description: "YYYY-MM-DD",
          },
        },
        {
          name: "checkOut",
          type: "text",
          required: true,
          admin: {
            width: "50%",
            description: "YYYY-MM-DD",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "adults",
          type: "number",
          required: true,
          min: 1,
          max: 18,
          defaultValue: 2,
          admin: { width: "50%" },
        },
        {
          name: "children",
          type: "number",
          required: true,
          min: 0,
          max: 18,
          defaultValue: 0,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "fullName",
      type: "text",
      required: true,
      maxLength: 120,
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "whatsapp",
          type: "text",
          required: true,
          maxLength: 40,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "purpose",
      type: "select",
      options: purposeOptions,
      required: false,
    },
    {
      name: "specialRequests",
      type: "textarea",
      maxLength: 2000,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: statusOptions,
      admin: {
        position: "sidebar",
        description:
          "Confirmed blocks nights on the website calendar (alongside any manual date blocks). Use the Stay calendar panel to preview conflicts before saving.",
        components: {
          Cell: "/components/payload/StatusCell#StatusCell",
        },
      },
    },
  ],
  timestamps: true,
};
