import { fail, ok, parseBody } from "@/lib/api";
import { paymentSchema } from "@/lib/validation";
import { getBooking, payBooking } from "@/lib/data/store";

export const dynamic = "force-dynamic";

// POST /api/v1/payments  -> mock-charge a booking, mark it paid + confirmed.
export async function POST(req: Request) {
  const parsed = await parseBody(req, paymentSchema);
  if ("response" in parsed) return parsed.response;

  const existing = getBooking(parsed.data.reference);
  if (!existing) return fail("Booking not found", 404);
  if (existing.paymentStatus === "paid")
    return fail("Booking already paid", 409);

  // Simulate a payment gateway authorize+capture.
  const booking = payBooking(parsed.data.reference);
  return ok({
    paid: true,
    method: parsed.data.method,
    transactionId: `mock_${crypto.randomUUID().slice(0, 12)}`,
    booking,
  });
}
