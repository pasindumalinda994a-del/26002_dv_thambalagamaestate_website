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
  chestnut: "#bc6c25",
  sage: "#7c7f78",
  cardBorder: "#CFCBB1",
} as const;

const FONT_SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_SERIF = "Georgia,'Times New Roman',serif";

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

function guestsLine(adults: number, children: number): string {
  const adultsText = `${adults} ${adults === 1 ? "adult" : "adults"}`;
  if (children <= 0) return adultsText;
  return `${adultsText} · ${children} ${children === 1 ? "child" : "children"}`;
}

function statusLabel(status: Booking["status"]): string {
  if (status === "new") return "New request";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

function siteHost(): string {
  try {
    return new URL(siteUrl()).hostname;
  } catch {
    return "thambalagamaestate.com";
  }
}

function logoUrl(): string {
  return `${siteUrl()}/logo/primary.png`;
}

export function bookingDetailUrl(bookingId: string): string {
  return `${siteUrl()}/admin/bookings/${bookingId}`;
}

export function ownerBookingEmailSubject(booking: Booking): string {
  return `New booking request — ${booking.fullName}`;
}

export function dashboardUrl(): string {
  return `${siteUrl()}/admin`;
}

type BookingEmailView = {
  detailUrl: string;
  dashboardUrl: string;
  logoSrc: string;
  host: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightsText: string;
  guestsTotal: number;
  guestsText: string;
  purpose: string;
  specialRequests: string;
  statusText: string;
  waHref: string | null;
};

function buildView(booking: Booking): BookingEmailView {
  const nights = nightCount(booking.checkIn, booking.checkOut);
  return {
    detailUrl: bookingDetailUrl(booking.id),
    dashboardUrl: dashboardUrl(),
    logoSrc: logoUrl(),
    host: siteHost(),
    checkIn: formatDateLong(booking.checkIn),
    checkOut: formatDateLong(booking.checkOut),
    nights,
    nightsText: nightsLabel(nights),
    guestsTotal: booking.adults + booking.children,
    guestsText: guestsLine(booking.adults, booking.children),
    purpose: formatPurpose(booking.purpose),
    specialRequests: booking.specialRequests.trim(),
    statusText: statusLabel(booking.status),
    waHref: whatsappHref(booking.whatsapp),
  };
}

function sectionHeading(title: string): string {
  return `<p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.chestnut};font-family:${FONT_SANS};">${escapeHtml(title)}</p>`;
}

function stayStat(
  label: string,
  valueHtml: string,
  opts?: { accent?: boolean },
): string {
  const accent = opts?.accent === true;
  return `
    <td style="width:33.33%;padding:16px 8px;text-align:center;vertical-align:top;">
      <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.olive};font-family:${FONT_SANS};">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:${accent ? "28px" : "14px"};font-weight:${accent ? "bold" : "normal"};line-height:1.3;color:${accent ? C.tan : C.deepForest};font-family:${accent ? FONT_SERIF : FONT_SANS};">${valueHtml}</p>
    </td>`;
}

function contactRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:8px 0;vertical-align:top;border-top:1px solid ${C.cardBorder};">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.olive};font-family:${FONT_SANS};">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:14px;line-height:1.45;color:${C.deepForest};font-family:${FONT_SANS};">${valueHtml}</p>
      </td>
    </tr>`;
}

function metaCell(label: string, value: string): string {
  return `
    <td style="width:50%;padding:0 12px 0 0;vertical-align:top;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.chestnut};font-family:${FONT_SANS};">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:14px;line-height:1.45;color:${C.deepForest};font-family:${FONT_SANS};">${escapeHtml(value)}</p>
    </td>`;
}

export function ownerBookingEmailText(booking: Booking): string {
  const view = buildView(booking);
  const lines = [
    "Thambalagama Estate — New booking request",
    "",
    booking.fullName,
    `${view.nightsText} · ${view.guestsTotal} ${view.guestsTotal === 1 ? "guest" : "guests"}`,
    `Status: ${view.statusText}`,
    "",
    "STAY",
    `Check-in:  ${view.checkIn}`,
    `Nights:    ${view.nights}`,
    `Check-out: ${view.checkOut}`,
    "",
    "CONTACT",
    `Email:    ${booking.email}`,
    `WhatsApp: ${booking.whatsapp}`,
    "",
    "PURPOSE",
    view.purpose,
    "",
    "GUESTS",
    view.guestsText,
  ];

  if (view.specialRequests) {
    lines.push("", "SPECIAL REQUESTS", view.specialRequests);
  }

  lines.push(
    "",
    `View booking: ${view.detailUrl}`,
    `Open dashboard: ${view.dashboardUrl}`,
  );

  return lines.join("\n");
}

export function ownerBookingEmailHtml(booking: Booking): string {
  const view = buildView(booking);
  const linkStyle = `color:${C.forest};text-decoration:underline;`;
  const emailLink = `<a href="mailto:${escapeHtml(booking.email)}" style="${linkStyle}">${escapeHtml(booking.email)}</a>`;
  const whatsappLink = view.waHref
    ? `<a href="${escapeHtml(view.waHref)}" style="${linkStyle}">${escapeHtml(booking.whatsapp)}</a>`
    : escapeHtml(booking.whatsapp);

  const requestsBlock = view.specialRequests
    ? `
          <tr>
            <td style="padding:8px 32px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.cream};">
                <tr>
                  <td style="padding:16px 18px;">
                    ${sectionHeading("Special requests")}
                    <p style="margin:0;font-size:14px;line-height:1.55;color:${C.deepForest};font-family:${FONT_SANS};">${escapeHtml(view.specialRequests).replaceAll("\n", "<br />")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${C.white};border:1px solid ${C.cardBorder};">
          <!-- Header -->
          <tr>
            <td style="background:${C.deepForest};padding:28px 32px 26px;text-align:center;">
              <img src="${escapeHtml(view.logoSrc)}" alt="Thambalagama Estate" width="56" height="56" style="display:block;margin:0 auto 14px;width:56px;height:auto;border:0;" />
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${C.tan};font-family:${FONT_SANS};">Thambalagama Estate</p>
              <h1 style="margin:0;font-size:24px;font-weight:normal;line-height:1.25;color:${C.cream};font-family:${FONT_SERIF};">New booking request</h1>
              <p style="margin:14px 0 0;">
                <span style="display:inline-block;background:${C.forest};color:${C.cream};padding:4px 10px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-family:${FONT_SANS};">${escapeHtml(view.statusText)}</span>
              </p>
            </td>
          </tr>

          <!-- Guest hero -->
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <p style="margin:0;font-size:22px;line-height:1.3;color:${C.deepForest};font-family:${FONT_SERIF};">
                ${escapeHtml(booking.fullName)}
              </p>
              <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:${C.sage};font-family:${FONT_SANS};">
                ${escapeHtml(view.nightsText)} · ${escapeHtml(String(view.guestsTotal))} ${view.guestsTotal === 1 ? "guest" : "guests"}
              </p>
            </td>
          </tr>

          <!-- Stay strip -->
          <tr>
            <td style="padding:20px 24px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid ${C.cardBorder};border-bottom:1px solid ${C.cardBorder};">
                <tr>
                  ${stayStat("Check-in", escapeHtml(view.checkIn))}
                  ${stayStat("Nights", escapeHtml(String(view.nights)), { accent: true })}
                  ${stayStat("Check-out", escapeHtml(view.checkOut))}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Purpose + guests -->
          <tr>
            <td style="padding:22px 32px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  ${metaCell("Purpose", view.purpose)}
                  ${metaCell("Guests", view.guestsText)}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:18px 32px 8px;">
              ${sectionHeading("Contact")}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${contactRow("Email", emailLink)}
                ${contactRow("WhatsApp", whatsappLink)}
              </table>
            </td>
          </tr>

          ${requestsBlock}

          <!-- CTA -->
          <tr>
            <td style="padding:28px 32px 32px;text-align:center;">
              <a href="${escapeHtml(view.detailUrl)}"
                 style="display:inline-block;background:${C.forest};color:${C.cream};text-decoration:none;padding:14px 32px;font-size:14px;font-weight:500;letter-spacing:0.2px;text-transform:uppercase;font-family:${FONT_SANS};">
                View booking
              </a>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.5;font-family:${FONT_SANS};">
                <a href="${escapeHtml(view.dashboardUrl)}" style="color:${C.forest};text-decoration:underline;">Open dashboard</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${C.deepForest};padding:18px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;line-height:1.5;color:#d5d6c4;font-family:${FONT_SANS};">
                Sent automatically · ${escapeHtml(view.host)}
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
