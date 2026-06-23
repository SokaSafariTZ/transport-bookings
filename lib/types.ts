// Shared domain model for SokaSafari Travel (flights + buses).
// Mirrors the Supabase schema in supabase/schema.sql.

export type TravelMode = "flights" | "buses";

export type LocationType = "airport" | "bus_terminal";

export interface Location {
  id: string;
  /** IATA code for airports, short slug for bus terminals (e.g. "NBO", "CAS-NTL"). */
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  type: LocationType;
}

export interface Operator {
  id: string;
  name: string;
  /** Two/three char display code, e.g. "AT" (Royal Air Maroc), "MC" (Modern Coast). */
  code: string;
  mode: TravelMode;
  logoColor: string;
  rating: number;
}

/** A bookable departure (a scheduled flight or bus trip). */
export interface Trip {
  id: string;
  mode: TravelMode;
  operatorId: string;
  originId: string;
  destinationId: string;
  departAt: string; // ISO
  arriveAt: string; // ISO
  /** Aircraft type for flights, coach class for buses. */
  vehicle: string;
  /** Flight/service number, e.g. "AT201", "MC also has bus reg". */
  serviceNumber: string;
  /** Number of stops (flights) / intermediate boarding points (buses). */
  stops: number;
  basePrice: number;
  currency: string;
  totalSeats: number;
  seatsAvailable: number;
  /** Amenities: wifi, meal, power, ac, recliner, entertainment. */
  amenities: string[];
}

export type FareClass = "economy" | "business" | "first" | "standard" | "vip";

export interface Fare {
  id: string;
  tripId: string;
  fareClass: FareClass;
  label: string;
  price: number;
  refundable: boolean;
  baggageKg: number;
  seatsAvailable: number;
}

export type SeatStatus = "available" | "occupied" | "selected";

export type SeatPosition =
  | "window-left"
  | "middle-left"
  | "aisle-left"
  | "aisle-right"
  | "middle-right"
  | "window-right";

export interface Seat {
  id: string;
  tripId: string;
  number: string; // "12A"
  row: number;
  col: string; // "A".."F"
  fareClass: FareClass;
  status: Exclude<SeatStatus, "selected">;
  priceModifier: number;
  /** Seat position relative to the aisle. Useful for bus layout rendering. */
  position: SeatPosition;
}

/** Metadata describing the physical layout of a vehicle's seat map. */
export interface SeatLayout {
  mode: "flights" | "buses";
  rows: number;
  cols: string[];
  /** Column letter after which the aisle gap appears. */
  aisleAfterCol: string;
  /** Rows (1-indexed) that belong to a premium fare class. */
  premiumRows: number;
  totalSeats: number;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface Passenger {
  id: string;
  bookingId: string;
  fullName: string;
  email?: string;
  phone?: string;
  documentType: "passport" | "national_id";
  documentNumber: string;
  nationality: string;
  seatNumber?: string;
  fareClass: FareClass;
}

export interface Booking {
  id: string;
  pnr: string;
  mode: TravelMode;
  tripId: string;
  userId?: string;
  contactEmail: string;
  contactPhone: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  passengerCount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

// ---- Hydrated read models returned by the API for convenience ----

export interface TripWithRefs extends Trip {
  operator: Operator;
  origin: Location;
  destination: Location;
  durationMinutes: number;
}

export interface BookingDetail extends Booking {
  trip: TripWithRefs;
  passengers: Passenger[];
}

export interface SearchParams {
  mode: TravelMode;
  from: string; // location code
  to: string; // location code
  date: string; // YYYY-MM-DD
  passengers: number;
  cabin?: FareClass;
}
