import { AdminShell } from "@/app/components/admin/AdminShell";
import {
  countByStatus,
  EMPTY_COUNTS,
} from "@/app/components/admin/booking-counts";
import { listBookings } from "@/lib/bookings/repository";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let counts = EMPTY_COUNTS;

  try {
    const bookings = await listBookings({ status: "all" });
    counts = countByStatus(bookings);
  } catch (error) {
    console.error("Failed to load admin sidebar counts", error);
  }

  return <AdminShell counts={counts}>{children}</AdminShell>;
}
