import type {
  Booking,
  BookingDetail,
  BookingStatus,
  PaymentStatus,
  Passenger,
} from "@/lib/types";
import { generatePnr } from "@/lib/utils";
import { getTrip } from "@/lib/data/trips";

// Module-level in-memory store. Persists for the lifetime of the server
// process — enough to demo the full booking lifecycle without a database.
// Swap for the Supabase driver (see supabase/schema.sql) in production.

declare global {
  // eslint-disable-next-line no-var
  var __soka_store:
    | { bookings: Map<string, Booking>; passengers: Map<string, Passenger[]> }
    | undefined;
}

const store =
  globalThis.__soka_store ??
  (globalThis.__soka_store = {
    bookings: new Map<string, Booking>(),
    passengers: new Map<string, Passenger[]>(),
  });

export interface CreateBookingInput {
  tripId: string;
  contactEmail: string;
  contactPhone: string;
  userId?: string;
  passengers: Omit<Passenger, "id" | "bookingId">[];
}

export function createBooking(input: CreateBookingInput): BookingDetail | null {
  const trip = getTrip(input.tripId);
  if (!trip) return null;

  const id = crypto.randomUUID();
  const pnr = generatePnr();
  const total = input.passengers.reduce((sum, p) => {
    // price by fare class via the trip base price
    const mult =
      p.fareClass === "business" || p.fareClass === "vip"
        ? trip.mode === "flights"
          ? 2.6
          : 1.6
        : p.fareClass === "first"
          ? 4.2
          : 1;
    return sum + Math.round(trip.basePrice * mult);
  }, 0);

  const booking: Booking = {
    id,
    pnr,
    mode: trip.mode,
    tripId: trip.id,
    userId: input.userId,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    status: "pending",
    paymentStatus: "unpaid",
    passengerCount: input.passengers.length,
    totalAmount: total,
    currency: trip.currency,
    createdAt: new Date().toISOString(),
  };

  const passengers: Passenger[] = input.passengers.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
    bookingId: id,
  }));

  store.bookings.set(id, booking);
  store.bookings.set(pnr, booking); // also index by PNR for lookups
  store.passengers.set(id, passengers);

  return { ...booking, trip, passengers };
}

export function getBooking(idOrPnr: string): BookingDetail | null {
  const booking = store.bookings.get(idOrPnr);
  if (!booking) return null;
  const trip = getTrip(booking.tripId);
  if (!trip) return null;
  return {
    ...booking,
    trip,
    passengers: store.passengers.get(booking.id) ?? [],
  };
}

export function listBookings(): BookingDetail[] {
  // de-dupe (bookings are indexed by both id and pnr)
  const seen = new Set<string>();
  const out: BookingDetail[] = [];
  for (const booking of store.bookings.values()) {
    if (seen.has(booking.id)) continue;
    seen.add(booking.id);
    const detail = getBooking(booking.id);
    if (detail) out.push(detail);
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateBookingStatus(
  idOrPnr: string,
  patch: { status?: BookingStatus; paymentStatus?: PaymentStatus },
): BookingDetail | null {
  const booking = store.bookings.get(idOrPnr);
  if (!booking) return null;
  if (patch.status) booking.status = patch.status;
  if (patch.paymentStatus) booking.paymentStatus = patch.paymentStatus;
  return getBooking(booking.id);
}

/** Mock payment: marks a pending booking paid + confirmed. */
export function payBooking(idOrPnr: string): BookingDetail | null {
  return updateBookingStatus(idOrPnr, {
    paymentStatus: "paid",
    status: "confirmed",
  });
}
