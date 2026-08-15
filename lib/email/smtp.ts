import { Resend } from "resend";
import type { Booking } from "@/lib/bookings/types";
import {
  ownerBookingEmailHtml,
  ownerBookingEmailSubject,
  ownerBookingEmailText,
} from "@/lib/email/owner-booking-email";

const OWNER_EMAIL_FALLBACK = "info@thambalagamaestate.com";

export async function sendOwnerBookingEmail(booking: Booking): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to = process.env.OWNER_EMAIL?.trim() || OWNER_EMAIL_FALLBACK;

  if (!apiKey || !from) {
    console.warn(
      "Owner booking email skipped: RESEND_API_KEY or EMAIL_FROM is not set",
    );
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: ownerBookingEmailSubject(booking),
    text: ownerBookingEmailText(booking),
    html: ownerBookingEmailHtml(booking),
  });

  if (error) throw new Error(error.message);
}
