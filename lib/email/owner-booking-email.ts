import type { Booking } from "@/lib/bookings/types";

const FALLBACK_SITE_URL = "http://localhost:3000";

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

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function bookingDetailUrl(bookingId: string): string {
  return `${siteUrl()}/admin/bookings/${bookingId}`;
}

export function ownerBookingEmailSubject(booking: Booking): string {
  return `New booking request — ${booking.fullName}`;
}

export function ownerBookingEmailText(booking: Booking): string {
  const detailUrl = bookingDetailUrl(booking.id);
  const lines = [
    "A new booking request was submitted on the Thambalagama Estate website.",
    "",
    `Guest: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `WhatsApp: ${booking.whatsapp}`,
    `Check-in: ${booking.checkIn}`,
    `Check-out: ${booking.checkOut}`,
    `Adults: ${booking.adults}`,
    `Children: ${booking.children}`,
    `Purpose: ${formatPurpose(booking.purpose)}`,
    `Special requests: ${booking.specialRequests.trim() || "—"}`,
    `Status: ${booking.status}`,
    "",
    `View booking: ${detailUrl}`,
  ];
  return lines.join("\n");
}

export function ownerBookingEmailHtml(booking: Booking): string {
  const detailUrl = bookingDetailUrl(booking.id);
  const rows: Array<[string, string]> = [
    ["Guest", booking.fullName],
    ["Email", booking.email],
    ["WhatsApp", booking.whatsapp],
    ["Check-in", booking.checkIn],
    ["Check-out", booking.checkOut],
    ["Adults", String(booking.adults)],
    ["Children", String(booking.children)],
    ["Purpose", formatPurpose(booking.purpose)],
    ["Special requests", booking.specialRequests.trim() || "—"],
    ["Status", booking.status],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8e4dc;color:#5c564c;font-size:13px;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8e4dc;color:#1a1814;font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(ownerBookingEmailSubject(booking))}</title>
</head>
<body style="margin:0;padding:0;background:#f5f2eb;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f2eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e4dc;">
          <tr>
            <td style="padding:28px 28px 8px;color:#1a1814;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7368;">Thambalagama Estate</p>
              <h1 style="margin:0;font-size:22px;font-weight:normal;line-height:1.3;">New booking request</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#5c564c;">
                ${escapeHtml(booking.fullName)} submitted a stay request. Review the details below.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 16px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8e4dc;">
                ${tableRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 32px;" align="center">
              <a href="${escapeHtml(detailUrl)}"
                 style="display:inline-block;background:#2f4a3a;color:#ffffff;text-decoration:none;padding:12px 28px;font-size:14px;letter-spacing:0.04em;">
                View booking
              </a>
              <p style="margin:16px 0 0;font-size:12px;line-height:1.4;color:#7a7368;word-break:break-all;">
                ${escapeHtml(detailUrl)}
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
