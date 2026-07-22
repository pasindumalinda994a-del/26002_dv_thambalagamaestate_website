export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSubmitted(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function nightCount(checkIn: string, checkOut: string) {
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  const a = new Date(y1, (m1 ?? 1) - 1, d1 ?? 1);
  const b = new Date(y2, (m2 ?? 1) - 1, d2 ?? 1);
  const nights = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
}

export function whatsappHref(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
