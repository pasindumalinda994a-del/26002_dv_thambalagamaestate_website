import { BookingList } from "@/app/components/admin/BookingList";
import { countByStatus } from "@/app/components/admin/booking-counts";
import { DashboardStats } from "@/app/components/admin/DashboardStats";
import { listBookings } from "@/lib/bookings/repository";
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings/types";

type SearchParams = Promise<{ status?: string }>;

function resolveStatus(value: string | undefined): BookingStatus | "all" {
  if (!value || value === "all") return "all";
  if ((BOOKING_STATUSES as readonly string[]).includes(value)) {
    return value as BookingStatus;
  }
  return "all";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = resolveStatus(params.status);
  let allBookings: Booking[] = [];
  let loadError: string | null = null;

  try {
    allBookings = await listBookings({ status: "all" });
  } catch (error) {
    console.error("Failed to load admin bookings", error);
    loadError = "Could not load bookings. Check the MongoDB connection.";
  }

  const counts = countByStatus(allBookings);
  const bookings =
    status === "all"
      ? allBookings
      : allBookings.filter((b) => b.status === status);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold text-forest-green">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-forest-green/60">
          Review stay requests submitted from the website.
        </p>
      </div>

      {!loadError ? (
        <div className="mb-8 hidden lg:block">
          <DashboardStats counts={counts} active={status} />
        </div>
      ) : null}

      {loadError ? (
        <p
          className="border border-chestnut/30 bg-white px-6 py-8 text-center font-secondary text-sm text-chestnut"
          role="alert"
        >
          {loadError}
        </p>
      ) : (
        <BookingList bookings={bookings} />
      )}
    </>
  );
}
