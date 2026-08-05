"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { createBooking, updateBookingStatus } from "@/lib/bookings/repository";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "@/lib/bookings/schema";
import type { Booking } from "@/lib/bookings/types";
import { sendOwnerBookingEmail } from "@/lib/email/smtp";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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

export async function updateBookingStatusAction(
  input: unknown,
): Promise<ActionResult<Booking>> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateBookingStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid status update",
    };
  }

  try {
    const booking = await updateBookingStatus(parsed.data.id, parsed.data.status);
    if (!booking) {
      return { ok: false, error: "Booking not found" };
    }
    revalidatePath("/admin");
    revalidatePath(`/admin/bookings/${parsed.data.id}`);
    revalidatePath("/", "layout");
    return { ok: true, data: booking };
  } catch (error) {
    console.error("updateBookingStatusAction failed", error);
    return { ok: false, error: "Could not update booking status" };
  }
}
