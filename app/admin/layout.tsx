import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings | Thambalagama Estate",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
