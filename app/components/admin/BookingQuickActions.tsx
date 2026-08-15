import type { Booking } from "@/lib/bookings/types";
import { CopyContactButton } from "./CopyContactButton";
import { whatsappHref } from "./format";

const actionClass =
  "font-secondary text-[12px] font-medium text-forest-green underline-offset-2 hover:underline";

export function BookingQuickActions({
  booking,
  className,
}: {
  booking: Booking;
  className?: string;
}) {
  const wa = whatsappHref(booking.whatsapp);

  return (
    <div className={["flex flex-wrap items-center gap-x-3 gap-y-1", className].filter(Boolean).join(" ")}>
      {wa ? (
        <CopyContactButton
          variant="link"
          label="WhatsApp"
          copyValue={booking.whatsapp}
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          copyAriaLabel="Copy WhatsApp number"
          className={actionClass}
        />
      ) : null}
      <CopyContactButton
        variant="link"
        label="Email"
        copyValue={booking.email}
        href={`mailto:${booking.email}`}
        copyAriaLabel="Copy email"
        className={actionClass}
      />
    </div>
  );
}
