import type { AdminCounts } from "./booking-counts";
import { AdminLayoutClient } from "./AdminLayoutClient";

export function AdminShell({
  counts,
  children,
}: {
  counts: AdminCounts;
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutClient counts={counts}>{children}</AdminLayoutClient>
  );
}
