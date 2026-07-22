import type { Booking } from "@/lib/bookings/types";
import { BookingCardList } from "./BookingCardList";
import { BookingTable } from "./BookingTable";

export function BookingList({ bookings }: { bookings: Booking[] }) {
  return (
    <>
      <div className="md:hidden">
        <BookingCardList bookings={bookings} />
      </div>
      <div className="hidden md:block">
        <BookingTable bookings={bookings} />
      </div>
    </>
  );
}
