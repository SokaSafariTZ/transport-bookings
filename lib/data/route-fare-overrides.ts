/**
 * Durable route fare overrides (admin "My Routes" prices).
 * In-memory catalog alone is not enough on Vercel — each serverless instance
 * has its own memory, so the app would keep seeing seed prices.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const TABLE = "route_fare_overrides";

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function routeFareOverridesEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Map of routeKey → basePrice USD. Empty when Supabase is unavailable. */
export async function loadRouteFareOverrides(): Promise<Record<string, number>> {
  const sb = serviceClient();
  if (!sb) return {};

  try {
    const { data, error } = await sb.from(TABLE).select("route_key, base_price");
    if (error || !Array.isArray(data)) {
      if (error) {
        console.warn("[route-fare-overrides] load failed", error.message);
      }
      return {};
    }

    const out: Record<string, number> = {};
    for (const row of data) {
      const key = String((row as { route_key?: string }).route_key ?? "");
      const price = Number((row as { base_price?: number }).base_price);
      if (key && Number.isFinite(price) && price >= 1) {
        out[key] = Math.round(price);
      }
    }
    return out;
  } catch (e) {
    console.warn("[route-fare-overrides] load error", e);
    return {};
  }
}

export async function saveRouteFareOverride(routeKey: string, basePrice: number): Promise<boolean> {
  const sb = serviceClient();
  if (!sb) return false;

  const price = Math.round(basePrice);
  if (!routeKey || !Number.isFinite(price) || price < 1) return false;

  try {
    const { error } = await sb.from(TABLE).upsert(
      {
        route_key: routeKey,
        base_price: price,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "route_key" },
    );
    if (error) {
      console.warn("[route-fare-overrides] save failed", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[route-fare-overrides] save error", e);
    return false;
  }
}
