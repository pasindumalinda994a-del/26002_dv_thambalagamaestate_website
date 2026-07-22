import { Resend } from "resend";
import type { Booking } from "@/lib/bookings/types";
import {
  ownerBookingEmailHtml,
  ownerBookingEmailSubject,
  ownerBookingEmailText,
} from "@/lib/email/owner-booking-email";

const OWNER_EMAIL_FALLBACK = "info@thambalagamaestate.com";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendOwnerBookingEmail(booking: Booking): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to =
    process.env.OWNER_EMAIL?.trim() || OWNER_EMAIL_FALLBACK;

  if (!apiKey || !from) {
    console.warn(
      "Owner booking email skipped: RESEND_API_KEY or EMAIL_FROM is not set",
    );
    return;
  }

  const resend = getResend();
  if (!resend) {
    console.warn("Owner booking email skipped: Resend client unavailable");
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: ownerBookingEmailSubject(booking),
    text: ownerBookingEmailText(booking),
    html: ownerBookingEmailHtml(booking),
  });

  if (error) {
    throw new Error(error.message);
  }
}
