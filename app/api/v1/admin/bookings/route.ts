import { ok } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import { listBookings } from "@/lib/data/booking-store";

export const dynamic = "force-dynamic";

// GET /api/v1/admin/bookings  -> all bookings (admin only)
export async function GET() {
  if (!(await isAdminAuthed()))
    return new Response("Unauthorized", { status: 401 });
  return ok(await listBookings());
}
