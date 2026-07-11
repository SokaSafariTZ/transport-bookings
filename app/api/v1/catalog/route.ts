import { ok } from "@/lib/api";
import { listLocations, listOperators, listRoutes, getLocationByCode } from "@/lib/data/catalog";
import { formatMoneyDual } from "@/lib/utils";
import type { TravelMode } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/v1/catalog?mode=flights|buses
// Returns the locations, operators and popular routes for a mode — powers the
// search form's autocomplete and the "popular routes" rails.
export async function GET(req: Request) {
  const mode = new URL(req.url).searchParams.get("mode") as TravelMode | null;

  const locationType = mode === "buses" ? "bus_terminal" : mode === "flights" ? "airport" : null;
  const locations = locationType
    ? listLocations().filter((l) => l.type === locationType)
    : listLocations();
  const operators = mode ? listOperators().filter((o) => o.mode === mode) : listOperators();

  const routes = listRoutes().filter((r) => (mode ? r.mode === mode : true)).map((r) => ({
    mode: r.mode,
    from: getLocationByCode(r.originCode),
    to: getLocationByCode(r.destCode),
    fromPrice: r.basePrice,
    fromPriceLabel: formatMoneyDual(r.basePrice),
  }));

  return ok({ locations, operators, routes });
}
