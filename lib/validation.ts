import { z } from "zod";

/** Strip markup / control chars while typing (keeps trailing space). */
export function sanitizePersonNameInput(raw: string): string {
  return raw
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/[^\p{L}\p{M}\s'.\-]/gu, "")
    .replace(/ {2,}/g, " ")
    .slice(0, 120);
}

export function sanitizePersonName(raw: string): string {
  return sanitizePersonNameInput(raw).trim();
}

export function sanitizeEmail(raw: string): string {
  return raw.trim().toLowerCase().replace(/[<>\s]/g, "").slice(0, 255);
}

export function sanitizePhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D+/g, "");
  if (!digits) return "";
  return trimmed.startsWith("+") ? `+${digits}`.slice(0, 16) : digits.slice(0, 15);
}

export function sanitizeNationality(raw: string): string {
  return raw.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
}

export function sanitizePassport(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function sanitizeNationalId(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 20);
}

export function sanitizeSeat(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
}

export function sanitizeDocumentNumber(
  raw: string,
  documentType: "passport" | "national_id",
  nationality: string,
): string {
  if (documentType === "national_id" && nationality === "TZ") {
    return sanitizeNationalId(raw);
  }
  return sanitizePassport(raw);
}

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Enter the full name as on the travel document.")
  .max(120, "Name is too long.")
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.\-]{0,118}$/u, "Name may only include letters, spaces, and - ' .");

const phoneSchema = z
  .string()
  .min(1, "Phone is required.")
  .regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number (9–15 digits, optionally starting with +).");

export const fareClassSchema = z.enum([
  "economy",
  "business",
  "first",
  "standard",
  "vip",
]);

export const passengerSchema = z
  .object({
    fullName: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    documentType: z.enum(["passport", "national_id"]).default("passport"),
    documentNumber: z.string(),
    nationality: z.string(),
    seatNumber: z.string().optional(),
    fareClass: fareClassSchema.default("economy"),
  })
  .superRefine((data, ctx) => {
    const nationality = sanitizeNationality(data.nationality);
    if (!/^[A-Z]{2}$/.test(nationality)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nationality must be a 2-letter country code (e.g. TZ).",
        path: ["nationality"],
      });
    }

    const nameParsed = personNameSchema.safeParse(sanitizePersonName(data.fullName));
    if (!nameParsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: nameParsed.error.issues[0]?.message ?? "Enter a valid name.",
        path: ["fullName"],
      });
    }

    const doc = sanitizeDocumentNumber(data.documentNumber, data.documentType, nationality);
    if (data.documentType === "national_id" && nationality === "TZ") {
      if (!/^\d{20}$/.test(doc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "NIDA must be exactly 20 digits.",
          path: ["documentNumber"],
        });
      }
    } else if (!/^[A-Z0-9]{6,12}$/.test(doc)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passport number must be 6–12 letters or digits.",
        path: ["documentNumber"],
      });
    }

    if (data.email) {
      const email = sanitizeEmail(data.email);
      if (!z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email.",
          path: ["email"],
        });
      }
    }

    if (data.phone) {
      const phone = sanitizePhone(data.phone);
      if (!phoneSchema.safeParse(phone).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid phone number.",
          path: ["phone"],
        });
      }
    }

    if (data.seatNumber) {
      const seat = sanitizeSeat(data.seatNumber);
      if (!/^[A-Z0-9]{1,8}$/.test(seat)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seat number is invalid.",
          path: ["seatNumber"],
        });
      }
    }
  })
  .transform((data) => {
    const nationality = sanitizeNationality(data.nationality);
    return {
      fullName: sanitizePersonName(data.fullName),
      documentType: data.documentType,
      documentNumber: sanitizeDocumentNumber(data.documentNumber, data.documentType, nationality),
      nationality,
      fareClass: data.fareClass,
      seatNumber: data.seatNumber ? sanitizeSeat(data.seatNumber) : undefined,
      email: data.email ? sanitizeEmail(data.email) : undefined,
      phone: data.phone ? sanitizePhone(data.phone) : undefined,
    };
  });

export const createBookingSchema = z
  .object({
    tripId: z
      .string()
      .trim()
      .min(3)
      .max(96)
      .regex(/^[A-Za-z0-9._:-]+$/, "Trip reference is invalid."),
    contactEmail: z.string(),
    contactPhone: z.string(),
    userId: z.string().max(64).optional(),
    passengers: z.array(passengerSchema).min(1).max(9),
  })
  .superRefine((data, ctx) => {
    const email = sanitizeEmail(data.contactEmail);
    if (!z.string().email().safeParse(email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid email address.",
        path: ["contactEmail"],
      });
    }
    const phone = sanitizePhone(data.contactPhone);
    if (!phoneSchema.safeParse(phone).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid phone number (9–15 digits, optionally starting with +).",
        path: ["contactPhone"],
      });
    }
  })
  .transform((data) => ({
    tripId: data.tripId.trim(),
    contactEmail: sanitizeEmail(data.contactEmail),
    contactPhone: sanitizePhone(data.contactPhone),
    userId: data.userId?.trim() || undefined,
    passengers: data.passengers,
  }));

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

export const routePricePatchSchema = z.object({
  key: z.string().min(3).max(64),
  basePrice: z.number().finite().min(1).max(100_000),
});

/** Client-side field errors for BookFlow (before API). */
export function validateBookingFormFields(input: {
  contactEmail: string;
  contactPhone: string;
  passengers: Array<{
    fullName: string;
    documentNumber: string;
    nationality: string;
    documentType: "passport" | "national_id";
  }>;
}):
  | { ok: true }
  | {
      ok: false;
      contact?: { email?: string; phone?: string };
      passengers: Record<
        number,
        Partial<Record<"fullName" | "documentNumber" | "nationality", string>>
      >;
    } {
  const passengers: Record<
    number,
    Partial<Record<"fullName" | "documentNumber" | "nationality", string>>
  > = {};
  let contact: { email?: string; phone?: string } | undefined;

  const email = sanitizeEmail(input.contactEmail);
  if (!z.string().email().safeParse(email).success) {
    contact = { ...contact, email: "Enter a valid email address." };
  }
  const phone = sanitizePhone(input.contactPhone);
  if (!phoneSchema.safeParse(phone).success) {
    contact = {
      ...contact,
      phone: "Enter a valid phone number (9–15 digits, optionally starting with +).",
    };
  }

  input.passengers.forEach((p, i) => {
    const parsed = passengerSchema.safeParse(p);
    if (!parsed.success) {
      const errs: Partial<Record<"fullName" | "documentNumber" | "nationality", string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "fullName" || key === "documentNumber" || key === "nationality") {
          errs[key] = issue.message;
        }
      }
      if (Object.keys(errs).length) passengers[i] = errs;
    }
  });

  if (contact || Object.keys(passengers).length > 0) {
    return { ok: false, contact, passengers };
  }
  return { ok: true };
}
