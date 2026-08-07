"use client";

import { useBooking } from "../../components/booking/BookingProvider";
import { Button } from "../../components/Button";
import { H2 } from "../../components/H2";
import { EXPERIENCES_CTA } from "../content";

export function ExperiencesCta() {
  const { open: openBooking } = useBooking();

  return (
    <section
      aria-label="Secure your sanctuary"
      className="flex min-h-[424px] w-full min-w-0 flex-col items-center justify-center overflow-x-hidden bg-[#717171] px-4 py-20 md:min-h-[640px] md:px-8 md:py-32"
    >
      <div className="flex w-full min-w-0 max-w-[1067px] flex-col items-center gap-8 md:gap-14">
        <H2 className="w-full max-w-full break-words text-center uppercase text-cream !text-[clamp(36px,8vw,54px)] md:!text-[clamp(36px,5.28vw,76px)]">
          {EXPERIENCES_CTA.headline}
        </H2>
        <Button variant="light" onClick={openBooking}>
          {EXPERIENCES_CTA.buttonLabel}
        </Button>
      </div>
    </section>
  );
}
