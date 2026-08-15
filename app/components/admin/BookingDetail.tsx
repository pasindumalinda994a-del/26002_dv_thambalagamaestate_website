import Link from "next/link";
import type { Booking } from "@/lib/bookings/types";
import { stayPhase, todayISO } from "./booking-ops";
import { CopyContactButton } from "./CopyContactButton";
import {
  formatDateLong,
  formatSubmitted,
  nightCount,
  whatsappHref,
} from "./format";
import { StayBadge } from "./StayBadge";
import { StatusSelect } from "./StatusSelect";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
        {label}
      </dt>
      <dd className="mt-1.5 font-secondary text-[15px] text-forest-green">
        {children}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-forest-green/15 bg-white px-5 py-5 sm:px-6">
      <h2 className="mb-4 font-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-forest-green">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ContactButtons({
  email,
  whatsapp,
  whatsappHref: wa,
}: {
  email: string;
  whatsapp: string;
  whatsappHref: string | null;
}) {
  return (
    <>
      <CopyContactButton
        variant="button"
        label="Email guest"
        copyValue={email}
        href={`mailto:${email}`}
        copyAriaLabel="Copy email"
      />
      {wa ? (
        <CopyContactButton
          variant="button"
          label="WhatsApp"
          copyValue={whatsapp}
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          copyAriaLabel="Copy WhatsApp number"
        />
      ) : null}
    </>
  );
}

export function BookingDetail({ booking }: { booking: Booking }) {
  const nights = nightCount(booking.checkIn, booking.checkOut);
  const wa = whatsappHref(booking.whatsapp);
  const phase = stayPhase(booking, todayISO());

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="font-secondary text-[12px] text-forest-green/55 transition-colors hover:text-forest-green"
            >
              ← Back to dashboard
            </Link>
            <div className="mt-3">
              <StayBadge phase={phase} />
            </div>
            <h1 className="mt-3 text-[clamp(28px,4vw,40px)] font-semibold text-forest-green">
              {booking.fullName}
            </h1>
            <p className="mt-2 font-secondary text-sm text-forest-green/60">
              Submitted {formatSubmitted(booking.createdAt)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="w-full sm:min-w-[160px]">
              <p className="mb-2 font-secondary text-[11px] font-medium uppercase tracking-[0.14em] text-forest-green/50">
                Status
              </p>
              <StatusSelect
                bookingId={booking.id}
                initialStatus={booking.status}
              />
            </div>
            <div className="hidden gap-3 md:flex">
              <ContactButtons
                email={booking.email}
                whatsapp={booking.whatsapp}
                whatsappHref={wa}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Stay">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Check-in">{formatDateLong(booking.checkIn)}</Field>
              <Field label="Check-out">{formatDateLong(booking.checkOut)}</Field>
              <Field label="Nights">
                {nights} {nights === 1 ? "night" : "nights"}
              </Field>
              <Field label="Purpose">
                <span className="capitalize">{booking.purpose || "—"}</span>
              </Field>
            </dl>
          </Section>

          <Section title="Guests">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Field label="Adults">{booking.adults}</Field>
              <Field label="Children">{booking.children}</Field>
              <Field label="Total">{booking.adults + booking.children}</Field>
            </dl>
          </Section>

          <Section title="Contact">
            <dl className="grid gap-4">
              <Field label="Email">
                <CopyContactButton
                  variant="link"
                  label={booking.email}
                  copyValue={booking.email}
                  href={`mailto:${booking.email}`}
                  copyAriaLabel="Copy email"
                  className="underline-offset-2 hover:underline"
                />
              </Field>
              <Field label="WhatsApp">
                {wa ? (
                  <CopyContactButton
                    variant="link"
                    label={booking.whatsapp}
                    copyValue={booking.whatsapp}
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    copyAriaLabel="Copy WhatsApp number"
                    className="underline-offset-2 hover:underline"
                  />
                ) : (
                  booking.whatsapp
                )}
              </Field>
            </dl>
          </Section>

          <Section title="Timeline">
            <dl className="grid gap-4">
              <Field label="Submitted">
                {formatSubmitted(booking.createdAt)}
              </Field>
              <Field label="Last updated">
                {formatSubmitted(booking.updatedAt)}
              </Field>
            </dl>
          </Section>
        </div>

        <Section title="Special requests">
          {booking.specialRequests ? (
            <p className="whitespace-pre-wrap font-secondary text-[15px] leading-relaxed text-forest-green">
              {booking.specialRequests}
            </p>
          ) : (
            <p className="font-secondary text-[14px] text-forest-green/50">
              No special requests noted.
            </p>
          )}
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-forest-green/15 bg-white p-4 md:hidden">
        <ContactButtons
          email={booking.email}
          whatsapp={booking.whatsapp}
          whatsappHref={wa}
        />
      </div>
    </>
  );
}
