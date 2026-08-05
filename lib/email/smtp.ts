import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { Booking } from "@/lib/bookings/types";
import {
  ownerBookingEmailHtml,
  ownerBookingEmailSubject,
  ownerBookingEmailText,
} from "@/lib/email/owner-booking-email";

const OWNER_EMAIL_FALLBACK = "info@thambalagamaestate.com";
const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 587;

let transporter: Transporter | null = null;

function getSmtpPort(): number {
  const raw = process.env.SMTP_PORT?.trim();
  if (!raw) return DEFAULT_SMTP_PORT;
  const port = Number(raw);
  return Number.isFinite(port) && port > 0 ? port : DEFAULT_SMTP_PORT;
}

function getTransporter(): Transporter | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  if (!transporter) {
    const port = getSmtpPort();
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

export async function sendOwnerBookingEmail(booking: Booking): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim();
  const to = process.env.OWNER_EMAIL?.trim() || OWNER_EMAIL_FALLBACK;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass || !from) {
    console.warn(
      "Owner booking email skipped: SMTP_USER, SMTP_PASS, or EMAIL_FROM is not set",
    );
    return;
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.warn("Owner booking email skipped: SMTP transporter unavailable");
    return;
  }

  await mailer.sendMail({
    from,
    to,
    subject: ownerBookingEmailSubject(booking),
    text: ownerBookingEmailText(booking),
    html: ownerBookingEmailHtml(booking),
  });
}
