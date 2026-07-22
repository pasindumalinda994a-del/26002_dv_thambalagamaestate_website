import type { BookingStatus } from "@/lib/bookings/types";
import { AdminLayoutClient } from "./AdminLayoutClient";

export function AdminShell({
  counts,
  children,
}: {
  counts: Record<BookingStatus | "all", number>;
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutClient counts={counts}>{children}</AdminLayoutClient>
  );
}
