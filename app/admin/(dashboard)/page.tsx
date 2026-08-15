import { BookingList } from "@/app/components/admin/BookingList";
import {
  countByStatus,
  emptyMessageForStatus,
} from "@/app/components/admin/booking-counts";
import {
  formatOpsDate,
  formatOpsSummary,
  partitionForDashboard,
  sortByStayDate,
  todayISO,
} from "@/app/components/admin/booking-ops";
import { STATUS_LABELS } from "@/app/components/admin/constants";
import { OpsStats } from "@/app/components/admin/DashboardStats";
import { TodayBoard } from "@/app/components/admin/TodayBoard";
import { listBookings } from "@/lib/bookings/repository";
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings/types";

type SearchParams = Promise<{ status?: string }>;

type DashboardView = "today" | "all" | BookingStatus;

function resolveView(value: string | undefined): DashboardView {
  if (!value) return "today";
  if (value === "all") return "all";
  if ((BOOKING_STATUSES as readonly string[]).includes(value)) {
    return value as BookingStatus;
  }
  return "today";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const view = resolveView(params.status);
  const today = todayISO();
  let allBookings: Booking[] = [];
  let loadError: string | null = null;

  try {
    allBookings = await listBookings({ status: "all" });
  } catch (error) {
    console.error("Failed to load admin bookings", error);
    loadError = "Could not load bookings. Check the MongoDB connection.";
  }

  const counts = countByStatus(allBookings);
  const partition = partitionForDashboard(allBookings, today);

  if (loadError) {
    return (
      <>
        <DashboardHeader
          title="Today"
          subtitle={formatOpsDate(today)}
        />
        <p
          className="border border-chestnut/30 bg-white px-6 py-8 text-center font-secondary text-sm text-chestnut"
          role="alert"
        >
          {loadError}
        </p>
      </>
    );
  }

  if (view === "today") {
    return (
      <>
        <DashboardHeader
          title="Today"
          subtitle={formatOpsDate(today)}
          summary={formatOpsSummary(partition, counts.new)}
        />
        <div className="mb-8">
          <OpsStats
            arriving={partition.arriving.length}
            inHouse={partition.inHouse.length}
            departing={partition.departing.length}
            newCount={counts.new}
          />
        </div>
        <TodayBoard partition={partition} today={today} />
      </>
    );
  }

  const status = view;
  const bookings =
    status === "all"
      ? allBookings
      : allBookings.filter((b) => b.status === status);

  return (
    <>
      <DashboardHeader
        title={status === "all" ? "All bookings" : STATUS_LABELS[status]}
        subtitle="Stay requests submitted from the website."
      />
      <BookingList
        bookings={sortByStayDate(bookings, today)}
        today={today}
        emptyMessage={emptyMessageForStatus(status)}
        searchable
      />
    </>
  );
}

function DashboardHeader({
  title,
  subtitle,
  summary,
}: {
  title: string;
  subtitle: string;
  summary?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-[clamp(28px,4vw,40px)] font-semibold text-forest-green">
        {title}
      </h1>
      <p className="mt-2 text-sm text-forest-green/60">{subtitle}</p>
      {summary ? (
        <p className="mt-1 font-secondary text-sm text-forest-green/80">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
