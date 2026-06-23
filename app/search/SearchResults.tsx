"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plane, Bus, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api-client";
import { TripCard } from "@/components/TripCard";
import { EmptyState, Spinner, Card } from "@/components/ui";
import type { SearchParams, TravelMode } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Sort = "cheapest" | "fastest" | "earliest";

export function SearchResults() {
  const params = useSearchParams();
  const query: SearchParams = {
    mode: (params.get("mode") as TravelMode) ?? "flights",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    date: params.get("date") ?? "",
    passengers: Number(params.get("passengers") ?? 1),
  };

  const [sort, setSort] = useState<Sort>("cheapest");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", query],
    queryFn: () => api.search(query),
    enabled: Boolean(query.from && query.to && query.date),
  });

  const results = useMemo(() => {
    let r = data?.results ?? [];
    if (maxPrice != null) r = r.filter((t) => t.basePrice <= maxPrice);
    r = [...r].sort((a, b) => {
      if (sort === "cheapest") return a.basePrice - b.basePrice;
      if (sort === "fastest") return a.durationMinutes - b.durationMinutes;
      return a.departAt.localeCompare(b.departAt);
    });
    return r;
  }, [data, sort, maxPrice]);

  const priceCeiling = useMemo(
    () => Math.max(0, ...(data?.results.map((t) => t.basePrice) ?? [0])),
    [data],
  );

  return (
    <div className="mx-auto max-w-6xl gap-6 px-4 py-6 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="mb-4 lg:mb-0">
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-title">
            <SlidersHorizontal className="size-4 text-primary" /> Filters
          </div>

          <label className="text-xs text-subtitle">Sort by</label>
          <div className="mt-2 grid gap-1">
            {(["cheapest", "fastest", "earliest"] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded-[10px] px-3 py-2 text-left text-sm capitalize transition ${
                  sort === s ? "bg-primary/15 text-primary" : "text-subtitle hover:bg-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {priceCeiling > 0 && (
            <div className="mt-4">
              <label className="text-xs text-subtitle">
                Max price: {maxPrice ?? priceCeiling}
              </label>
              <input
                type="range"
                min={0}
                max={priceCeiling}
                value={maxPrice ?? priceCeiling}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-primary)]"
              />
            </div>
          )}
        </Card>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          {query.mode === "flights" ? (
            <Plane className="size-5 text-primary" />
          ) : (
            <Bus className="size-5 text-gold" />
          )}
          <h1 className="text-lg font-bold text-title">
            {query.from} → {query.to}
          </h1>
          <span className="text-sm text-subtitle">
            · {query.date && formatDate(query.date)} · {query.passengers} traveller
            {query.passengers > 1 ? "s" : ""}
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 py-16 text-subtitle">
            <Spinner /> Searching {query.mode}…
          </div>
        )}

        {isError && (
          <EmptyState title="Search failed" subtitle={(error as Error)?.message} />
        )}

        {!isLoading && !isError && results.length === 0 && (
          <EmptyState
            title="No departures found"
            subtitle="Try another date or route. Not every city pair runs every day."
          />
        )}

        <div className="grid gap-3">
          {results.map((t) => (
            <TripCard key={t.id} trip={t} passengers={query.passengers} />
          ))}
        </div>
      </div>
    </div>
  );
}
