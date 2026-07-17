export const BOOKING_STATUSES = [
  "new",
  "contacted",
  "confirmed",
  "declined",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_PURPOSES = [
  "wellness",
  "corporate",
  "celebration",
  "other",
] as const;

export type BookingPurpose = (typeof BOOKING_PURPOSES)[number];

export type BookingDocument = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  whatsapp: string;
  purpose: BookingPurpose | "";
  specialRequests: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type Booking = BookingDocument & {
  id: string;
};
