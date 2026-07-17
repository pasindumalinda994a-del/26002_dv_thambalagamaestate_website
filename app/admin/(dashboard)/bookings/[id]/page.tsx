import { notFound } from "next/navigation";
import { BookingDetail } from "@/app/components/admin/BookingDetail";
import { getBookingById } from "@/lib/bookings/repository";

type Params = Promise<{ id: string }>;

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  return <BookingDetail booking={booking} />;
}
