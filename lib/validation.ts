import { z } from "zod";

export const fareClassSchema = z.enum([
  "economy",
  "business",
  "first",
  "standard",
  "vip",
]);

export const passengerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  documentType: z.enum(["passport", "national_id"]).default("passport"),
  documentNumber: z.string().min(3),
  nationality: z.string().min(2),
  seatNumber: z.string().optional(),
  fareClass: fareClassSchema.default("economy"),
});

export const createBookingSchema = z.object({
  tripId: z.string().min(3),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  userId: z.string().optional(),
  passengers: z.array(passengerSchema).min(1).max(9),
});

export const paymentSchema = z.object({
  reference: z.string().min(4), // booking id or PNR
  method: z.enum(["card", "mobile_money", "wallet"]).default("card"),
});

export const operatorInputSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1).max(4),
  name: z.string().min(2),
  mode: z.enum(["flights", "buses"]),
  logoColor: z.string().default("#3B9EFF"),
  rating: z.number().min(0).max(5).default(4),
});

export const locationInputSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2),
  name: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  countryCode: z.string().min(2).max(2),
  type: z.enum(["airport", "bus_terminal"]),
});

export const bookingPatchSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "failed"]).optional(),
});
