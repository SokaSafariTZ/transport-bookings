import { fail, ok, parseBody } from "@/lib/api";
import { isAdminAuthed } from "@/lib/auth";
import {
  ensureRouteFaresHydrated,
  getLocationByCode,
  getOperatorById,
  listRoutes,
  routeKey,
  updateRouteBasePricePersistent,
} from "@/lib/data/catalog";
import { formatMoneyDual, usdToTzsCash } from "@/lib/utils";
import { routePricePatchSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);

  await ensureRouteFaresHydrated();

  const mode = new URL(req.url).searchParams.get("mode");
  const routes = listRoutes()
    .filter((r) => (mode === "flights" || mode === "buses" ? r.mode === mode : true))
    .map((r) => {
      const from = getLocationByCode(r.originCode);
      const to = getLocationByCode(r.destCode);
      return {
        key: routeKey(r),
        mode: r.mode,
        originCode: r.originCode,
        destCode: r.destCode,
        originCity: from?.city ?? r.originCode,
        destCity: to?.city ?? r.destCode,
        minutes: r.minutes,
        daily: r.daily,
        stops: r.stops,
        basePrice: r.basePrice,
        basePriceTzs: usdToTzsCash(r.basePrice),
        priceLabel: formatMoneyDual(r.basePrice),
        operators: r.operatorIds.map((id) => getOperatorById(id)?.name ?? id),
      };
    });

  return ok(routes);
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthed())) return fail("Unauthorized", 401);

  const parsed = await parseBody(req, routePricePatchSchema);
  if ("response" in parsed) return parsed.response;

  const updated = await updateRouteBasePricePersistent(parsed.data.key, parsed.data.basePrice);
  if (!updated) return fail("Route not found or invalid price", 404);

  return ok({
    key: routeKey(updated),
    basePrice: updated.basePrice,
    basePriceTzs: usdToTzsCash(updated.basePrice),
    priceLabel: formatMoneyDual(updated.basePrice),
  });
}
