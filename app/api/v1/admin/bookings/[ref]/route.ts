import { fail, ok, parseBody } from "@/lib/api";
import { isAdminAuthed, getAdminRole } from "@/lib/auth";
import { bookingPatchSchema } from "@/lib/validation";
import { getBooking, updateBookingStatus } from "@/lib/data/booking-store";

export const dynamic = "force-dynamic";

function roleAllowsMode(
  role: Awaited<ReturnType<typeof getAdminRole>>,
  mode: string,
): boolean {
  if (role === "flights") return mode === "flights";
  if (role === "buses") return mode === "buses";
  return true;
}

// GET /api/v1/admin/bookings/:ref
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { ref } = await params;
  const booking = await getBooking(ref);
  if (!booking) return fail("Booking not found", 404);

  const role = await getAdminRole();
  if (!roleAllowsMode(role, booking.mode)) {
    return fail("Booking not found", 404);
  }

  return ok(booking);
}

// PATCH /api/v1/admin/bookings/:ref
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);
  const { ref } = await params;
  const parsed = await parseBody(req, bookingPatchSchema);
  if ("response" in parsed) return parsed.response;

  const existing = await getBooking(ref);
  if (!existing) return fail("Booking not found", 404);

  const role = await getAdminRole();
  if (!roleAllowsMode(role, existing.mode)) {
    return fail("Booking not found", 404);
  }

  const booking = await updateBookingStatus(ref, parsed.data);
  if (!booking) return fail("Booking not found", 404);
  return ok(booking);
}
