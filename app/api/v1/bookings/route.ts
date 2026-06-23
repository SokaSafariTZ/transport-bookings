import { fail, ok, parseBody } from "@/lib/api";
import { createBookingSchema } from "@/lib/validation";
import { createBooking } from "@/lib/data/store";

export const dynamic = "force-dynamic";

// POST /api/v1/bookings  -> create a pending booking (returns PNR)
export async function POST(req: Request) {
  const parsed = await parseBody(req, createBookingSchema);
  if ("response" in parsed) return parsed.response;

  const booking = createBooking(parsed.data);
  if (!booking) return fail("Trip not found or no longer available", 404);

  return ok(booking, { status: 201 });
}
