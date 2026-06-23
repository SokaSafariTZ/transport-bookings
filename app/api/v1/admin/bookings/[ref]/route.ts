import { fail, ok, parseBody } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import { bookingPatchSchema } from "@/lib/validation";
import { updateBookingStatus } from "@/lib/data/booking-store";

export const dynamic = "force-dynamic";

// PATCH /api/v1/admin/bookings/:ref  -> update booking / payment status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { ref } = await params;
  const parsed = await parseBody(req, bookingPatchSchema);
  if ("response" in parsed) return parsed.response;

  const booking = await updateBookingStatus(ref, parsed.data);
  if (!booking) return fail("Booking not found", 404);
  return ok(booking);
}
