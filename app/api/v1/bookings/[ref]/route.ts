import { fail, ok } from "@/lib/api";
import { getBooking } from "@/lib/data/store";

export const dynamic = "force-dynamic";

// GET /api/v1/bookings/:ref  (ref = booking id or PNR)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params;
  const booking = getBooking(ref);
  if (!booking) return fail("Booking not found", 404);
  return ok(booking);
}
