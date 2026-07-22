import { z } from "zod";
import { BOOKING_PURPOSES, BOOKING_STATUSES } from "./types";

const MAX_GUESTS = 18;
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const createBookingSchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    adults: z.coerce.number().int().min(1).max(MAX_GUESTS),
    children: z.coerce.number().int().min(0).max(MAX_GUESTS),
    fullName: z.string().trim().min(1, "Full name is required").max(120),
    email: z.string().trim().email("Valid email is required").max(254),
    whatsapp: z.string().trim().min(5, "WhatsApp number is required").max(40),
    purpose: z.union([z.enum(BOOKING_PURPOSES), z.literal("")]).default(""),
    specialRequests: z.string().trim().max(2000).default(""),
  })
  .superRefine((data, ctx) => {
    if (data.adults + data.children > MAX_GUESTS) {
      ctx.addIssue({
        code: "custom",
        message: `Total guests cannot exceed ${MAX_GUESTS}`,
        path: ["adults"],
      });
    }
    if (data.checkOut <= data.checkIn) {
      ctx.addIssue({
        code: "custom",
        message: "Check-out must be after check-in",
        path: ["checkOut"],
      });
    }
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
});

export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
