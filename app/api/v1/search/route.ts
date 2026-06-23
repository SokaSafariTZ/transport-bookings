import { fail, ok } from "@/lib/api";
import { searchTrips } from "@/lib/data/trips";
import type { TravelMode } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/v1/search?mode=flights&from=NBO&to=CMN&date=2026-07-01&passengers=1
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const mode = p.get("mode") as TravelMode | null;
  const from = p.get("from");
  const to = p.get("to");
  const date = p.get("date");
  const passengers = Math.max(1, Number(p.get("passengers") ?? "1"));

  if (mode !== "flights" && mode !== "buses")
    return fail("mode must be 'flights' or 'buses'", 400);
  if (!from || !to) return fail("'from' and 'to' codes are required", 400);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return fail("'date' must be YYYY-MM-DD", 400);

  const results = searchTrips({ mode, from, to, date }).filter(
    (t) => t.seatsAvailable >= passengers,
  );

  return ok({
    query: { mode, from, to, date, passengers },
    count: results.length,
    results,
  });
}
