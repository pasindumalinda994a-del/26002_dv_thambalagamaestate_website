"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useBooking } from "./BookingProvider";

const BookingDrawer = dynamic(
  () => import("./BookingDrawer").then((mod) => ({ default: mod.BookingDrawer })),
  { ssr: false },
);

/** Loads the booking drawer chunk only after the first open. */
export function LazyBookingDrawer() {
  const { isOpen } = useBooking();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isOpen) setShouldLoad(true);
  }, [isOpen]);

  if (!shouldLoad) return null;
  return <BookingDrawer />;
}
