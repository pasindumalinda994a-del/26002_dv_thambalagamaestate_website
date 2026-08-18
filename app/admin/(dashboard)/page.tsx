import { BookingActivityChart } from "@/app/components/admin/BookingActivityChart";
import { BookingList } from "@/app/components/admin/BookingList";
import { BookingOpsCard } from "@/app/components/admin/BookingOpsCard";
import { buildActivitySeries } from "@/app/components/admin/booking-chart";
import { countByStatus } from "@/app/components/admin/booking-counts";
import {
  emptyMessageForList,
  filterByPeriod,
  resolvePeriod,
  submittedOn,
} from "@/app/components/admin/booking-filters";
import {
  formatOpsDate,
  formatOpsSummary,
  partitionForDashboard,
  sortByStayDate,
  todayISO,
} from "@/app/components/admin/booking-ops";
import { STATUS_LABELS } from "@/app/components/admin/constants";
import { OpsStats } from "@/app/components/admin/DashboardStats";
import { listBookings } from "@/lib/bookings/repository";
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings/types";

type SearchParams = Promise<{ status?: string; period?: string }>;

type DashboardView = "dashboard" | BookingStatus;

function resolveView(value: string | undefined): DashboardView {
  if (!value || value === "all" || value === "today") return "dashboard";
  if ((BOOKING_STATUSES as readonly string[]).includes(value)) {
    return value as BookingStatus;
  }
  return "dashboard";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const view = resolveView(params.status);
  const period = resolvePeriod(params.period);
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
        <DashboardHeader title="Dashboard" subtitle={formatOpsDate(today)} />
        <p
          className="border border-chestnut/30 bg-white px-6 py-8 text-center font-secondary text-sm text-chestnut"
          role="alert"
        >
          {loadError}
        </p>
      </>
    );
  }

  if (view === "dashboard") {
    const todayRequests = allBookings.filter((booking) =>
      submittedOn(booking, today),
    );
    const series = buildActivitySeries(allBookings, today);

    return (
      <>
        <DashboardHeader
          title="Dashboard"
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

        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
              Booking requests
            </h2>
            <span className="font-secondary text-[12px] text-forest-green/50">
              Last 30 days
            </span>
          </div>
          <BookingActivityChart series={series} />
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
              Today&apos;s booking requests
            </h2>
            <span className="font-secondary text-[12px] font-semibold tabular-nums text-forest-green/50">
              {todayRequests.length}
            </span>
          </div>
          {todayRequests.length === 0 ? (
            <p className="border border-forest-green/10 bg-white px-4 py-5 font-secondary text-[13px] text-forest-green/50">
              No booking requests today.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {todayRequests.map((booking) => (
                <li key={booking.id}>
                  <BookingOpsCard
                    booking={booking}
                    today={today}
                    showBadge
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </>
    );
  }

  const status = view;
  const bookings = filterByPeriod(
    allBookings.filter((booking) => booking.status === status),
    period,
    today,
  );

  return (
    <>
      <DashboardHeader
        title={STATUS_LABELS[status]}
        subtitle="Stay requests submitted from the website."
      />
      <BookingList
        bookings={sortByStayDate(bookings, today)}
        today={today}
        emptyMessage={emptyMessageForList(status, period)}
        searchable
        filters={{ status, period }}
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
