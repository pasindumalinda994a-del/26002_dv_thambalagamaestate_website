import type { Booking } from "@/lib/bookings/types";
import { BookingOpsCard } from "./BookingOpsCard";
import type { DashboardPartition } from "./booking-ops";

function OpsSection({
  id,
  title,
  empty,
  bookings,
  today,
  showBadge = false,
}: {
  id: string;
  title: string;
  empty: string;
  bookings: Booking[];
  today: string;
  showBadge?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
          {title}
        </h2>
        <span className="font-secondary text-[12px] font-semibold tabular-nums text-forest-green/50">
          {bookings.length}
        </span>
      </div>
      {bookings.length === 0 ? (
        <p className="border border-forest-green/10 bg-white px-4 py-5 font-secondary text-[13px] text-forest-green/50">
          {empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BookingOpsCard
                booking={booking}
                today={today}
                showBadge={showBadge}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TodayBoard({
  partition,
  today,
}: {
  partition: DashboardPartition;
  today: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <OpsSection
        id="arriving"
        title="Arriving today"
        empty="No arrivals today."
        bookings={partition.arriving}
        today={today}
      />
      <OpsSection
        id="in-house"
        title="In house"
        empty="No guests in house."
        bookings={partition.inHouse}
        today={today}
      />
      <OpsSection
        id="departing"
        title="Departing today"
        empty="No departures today."
        bookings={partition.departing}
        today={today}
      />
      <OpsSection
        id="needs-reply"
        title="Needs reply"
        empty="No requests waiting for a reply."
        bookings={partition.needsReply}
        today={today}
        showBadge
      />
      <OpsSection
        id="this-week"
        title="This week"
        empty="No confirmed stays arriving this week."
        bookings={partition.thisWeek}
        today={today}
        showBadge
      />
    </div>
  );
}
