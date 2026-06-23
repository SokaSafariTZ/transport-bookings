import { fail, ok } from "@/lib/api";
import { getTrip, getFares, getSeatMap } from "@/lib/data/trips";

export const dynamic = "force-dynamic";

// GET /api/v1/trips/:id/seats
// Dedicated seat-map endpoint for the Expo app.
// Returns layout metadata + full seat grid so the app can render its own
// bus/flight seat picker without loading the full trip object.
//
// Response shape:
//   {
//     data: {
//       tripId, mode, vehicle, totalSeats, seatsAvailable,
//       layout: { rows, cols, aisleAfterCol, premiumRows, totalSeats },
//       fares: Fare[],
//       seats: Seat[]   // includes position, fareClass, status per seat
//     }
//   }
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trip = getTrip(id);
  if (!trip) return fail("Trip not found", 404);

  const { layout, seats } = getSeatMap(trip);

  return ok({
    tripId: trip.id,
    mode: trip.mode,
    vehicle: trip.vehicle,
    serviceNumber: trip.serviceNumber,
    operator: trip.operator,
    origin: trip.origin,
    destination: trip.destination,
    departAt: trip.departAt,
    arriveAt: trip.arriveAt,
    totalSeats: trip.totalSeats,
    seatsAvailable: trip.seatsAvailable,
    layout,
    fares: getFares(trip),
    seats,
  });
}
