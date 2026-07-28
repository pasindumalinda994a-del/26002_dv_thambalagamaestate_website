import type { Booking } from "@/lib/bookings/types";

const FALLBACK_SITE_URL = "http://localhost:3000";

/** Brand tokens aligned with app/globals.css (inline for email clients). */
const C = {
  cream: "#fefae0",
  white: "#ffffff",
  deepForest: "#18200e",
  forest: "#283618",
  olive: "#606c38",
  tan: "#dda15e",
  sage: "#7c7f78",
  ink: "#171717",
  border: "#e4d2b0",
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPurpose(purpose: Booking["purpose"]): string {
  if (!purpose) return "—";
  return purpose.charAt(0).toUpperCase() + purpose.slice(1);
}

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function nightCount(checkIn: string, checkOut: string): number {
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  const a = new Date(y1, (m1 ?? 1) - 1, d1 ?? 1);
  const b = new Date(y2, (m2 ?? 1) - 1, d2 ?? 1);
  const nights = Math.round(
    (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, nights);
}

function whatsappHref(whatsapp: string): string | null {
  const digits = whatsapp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function nightsLabel(nights: number): string {
  return `${nights} ${nights === 1 ? "night" : "nights"}`;
}

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

function logoUrl(): string {
  return `${siteUrl()}/Logo/ThambalagamaLogo.png`;
}

export function bookingDetailUrl(bookingId: string): string {
  return `${siteUrl()}/admin/bookings/${bookingId}`;
}

export function ownerBookingEmailSubject(booking: Booking): string {
  return `New booking request — ${booking.fullName}`;
}

type BookingEmailView = {
  detailUrl: string;
  logoSrc: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightsText: string;
  guestsTotal: number;
  purpose: string;
  specialRequests: string;
  waHref: string | null;
};

function buildView(booking: Booking): BookingEmailView {
  const nights = nightCount(booking.checkIn, booking.checkOut);
  return {
    detailUrl: bookingDetailUrl(booking.id),
    logoSrc: logoUrl(),
    checkIn: formatDateLong(booking.checkIn),
    checkOut: formatDateLong(booking.checkOut),
    nights,
    nightsText: nightsLabel(nights),
    guestsTotal: booking.adults + booking.children,
    purpose: formatPurpose(booking.purpose),
    specialRequests: booking.specialRequests.trim() || "—",
    waHref: whatsappHref(booking.whatsapp),
  };
}

function sectionHeading(title: string): string {
  return `<p style="margin:0 0 10px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.olive};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${escapeHtml(title)}</p>`;
}

function detailRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:6px 0;width:118px;vertical-align:top;font-size:13px;color:${C.sage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;vertical-align:top;font-size:14px;line-height:1.45;color:${C.ink};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${valueHtml}</td>
    </tr>`;
}

export function ownerBookingEmailText(booking: Booking): string {
  const view = buildView(booking);
  const lines = [
    "Thambalagama Estate — New booking request",
    "",
    `${booking.fullName} submitted a stay request (${view.nightsText}).`,
    "",
    "STAY",
    `Check-in:  ${view.checkIn}`,
    `Check-out: ${view.checkOut}`,
    `Duration:  ${view.nightsText}`,
    "",
    "GUESTS",
    `Adults:   ${booking.adults}`,
    `Children: ${booking.children}`,
    `Total:    ${view.guestsTotal}`,
    "",
    "CONTACT",
    `Name:     ${booking.fullName}`,
    `Email:    ${booking.email}`,
    `WhatsApp: ${booking.whatsapp}`,
    "",
    "DETAILS",
    `Purpose:          ${view.purpose}`,
    `Special requests: ${view.specialRequests}`,
    `Status:           ${booking.status}`,
    "",
    `View in dashboard: ${view.detailUrl}`,
  ];
  return lines.join("\n");
}

export function ownerBookingEmailHtml(booking: Booking): string {
  const view = buildView(booking);
  const emailLink = `<a href="mailto:${escapeHtml(booking.email)}" style="color:${C.forest};text-decoration:underline;">${escapeHtml(booking.email)}</a>`;
  const whatsappLink = view.waHref
    ? `<a href="${escapeHtml(view.waHref)}" style="color:${C.forest};text-decoration:underline;">${escapeHtml(booking.whatsapp)}</a>`
    : escapeHtml(booking.whatsapp);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(ownerBookingEmailSubject(booking))}</title>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${C.white};border:1px solid ${C.border};">
          <!-- Header -->
          <tr>
            <td style="background:${C.deepForest};padding:28px 28px 24px;text-align:center;">
              <img src="${escapeHtml(view.logoSrc)}" alt="Thambalagama Estate" width="72" height="72" style="display:block;margin:0 auto 14px;width:72px;height:auto;border:0;" />
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.tan};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Thambalagama Estate</p>
              <h1 style="margin:0;font-size:24px;font-weight:normal;line-height:1.25;color:${C.cream};font-family:Georgia,'Times New Roman',serif;">New booking request</h1>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:24px 28px 8px;border-bottom:2px solid ${C.tan};">
              <p style="margin:0;font-size:17px;line-height:1.4;color:${C.deepForest};font-family:Georgia,'Times New Roman',serif;">
                ${escapeHtml(booking.fullName)}
              </p>
              <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:${C.sage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                Stay request · ${escapeHtml(view.nightsText)} · ${escapeHtml(String(view.guestsTotal))} ${view.guestsTotal === 1 ? "guest" : "guests"}
              </p>
            </td>
          </tr>

          <!-- Stay -->
          <tr>
            <td style="padding:22px 28px 4px;">
              ${sectionHeading("Stay")}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${detailRow("Check-in", escapeHtml(view.checkIn))}
                ${detailRow("Check-out", escapeHtml(view.checkOut))}
                ${detailRow("Duration", escapeHtml(view.nightsText))}
              </table>
            </td>
          </tr>

          <!-- Guests -->
          <tr>
            <td style="padding:18px 28px 4px;">
              ${sectionHeading("Guests")}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${detailRow("Adults", escapeHtml(String(booking.adults)))}
                ${detailRow("Children", escapeHtml(String(booking.children)))}
                ${detailRow("Total", escapeHtml(String(view.guestsTotal)))}
              </table>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:18px 28px 4px;">
              ${sectionHeading("Contact")}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${detailRow("Name", escapeHtml(booking.fullName))}
                ${detailRow("Email", emailLink)}
                ${detailRow("WhatsApp", whatsappLink)}
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:18px 28px 8px;">
              ${sectionHeading("Details")}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${detailRow("Purpose", escapeHtml(view.purpose))}
                ${detailRow("Requests", escapeHtml(view.specialRequests).replaceAll("\n", "<br />"))}
                ${detailRow("Status", escapeHtml(booking.status))}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 28px 32px;text-align:center;">
              <a href="${escapeHtml(view.detailUrl)}"
                 style="display:inline-block;background:${C.forest};color:${C.cream};text-decoration:none;padding:14px 32px;font-size:14px;letter-spacing:0.06em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                View in dashboard
              </a>
              <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:${C.sage};word-break:break-all;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                ${escapeHtml(view.detailUrl)}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${C.cream};padding:16px 28px;border-top:1px solid ${C.border};text-align:center;">
              <p style="margin:0;font-size:11px;line-height:1.5;color:${C.sage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                Sent automatically when a guest requests a stay on thambalagamaestate.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
