import { fail, ok } from "@/lib/api";
import { getTrip, getFares, getSeatMap } from "@/lib/data/trips";

export const dynamic = "force-dynamic";

// GET /api/v1/trips/:id
// Returns the full trip detail, all fare tiers, the seat map, and layout metadata.
// The Expo app and the website booking flow both consume this endpoint.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trip = getTrip(id);
  if (!trip) return fail("Trip not found", 404);

  const { layout, seats } = getSeatMap(trip);
  return ok({ trip, fares: getFares(trip), layout, seats });
}
