"use server";

import {
  createBooking,
  listConfirmedUnavailableDates,
} from "@/lib/bookings/repository";
import { createBookingSchema } from "@/lib/bookings/schema";
import { sendOwnerBookingEmail } from "@/lib/email/smtp";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getUnavailableDatesAction(): Promise<
  ActionResult<string[]>
> {
  try {
    const dates = await listConfirmedUnavailableDates();
    return { ok: true, data: dates };
  } catch (error) {
    console.error("getUnavailableDatesAction failed", error);
    return { ok: false, error: "Could not load availability." };
  }
}

export async function createBookingAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid booking details",
    };
  }

  try {
    const booking = await createBooking(parsed.data);
    try {
      await sendOwnerBookingEmail(booking);
    } catch (error) {
      console.error("Owner booking email failed", error);
    }
    return { ok: true, data: { id: booking.id } };
  } catch (error) {
    console.error("createBookingAction failed", error);
    return {
      ok: false,
      error: "Could not submit your request. Please try again shortly.",
    };
  }
}
