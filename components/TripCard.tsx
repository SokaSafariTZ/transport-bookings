import Link from "next/link";
import { Plane, Bus, Wifi, Zap, Snowflake, Armchair, Utensils, Tv, Clock } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { formatDuration, formatMoney, formatTime } from "@/lib/utils";
import type { TripWithRefs } from "@/lib/types";

const AMENITY_ICON: Record<string, typeof Wifi> = {
  wifi: Wifi,
  power: Zap,
  ac: Snowflake,
  recliner: Armchair,
  meal: Utensils,
  entertainment: Tv,
};

export function TripCard({ trip, passengers }: { trip: TripWithRefs; passengers: number }) {
  const Icon = trip.mode === "flights" ? Plane : Bus;
  return (
    <Card className="overflow-hidden p-4 transition hover:border-primary/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Operator */}
        <div className="flex items-center gap-3 sm:w-44">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-[12px] text-white"
            style={{ backgroundColor: trip.operator.logoColor }}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-title">{trip.operator.name}</p>
            <p className="text-xs text-subtitle">
              {trip.serviceNumber} · {trip.vehicle}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-1 items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-title">{formatTime(trip.departAt)}</p>
            <p className="text-xs text-subtitle">{trip.origin.code}</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <span className="flex items-center gap-1 text-[11px] text-subtitle">
              <Clock className="size-3" />
              {formatDuration(trip.durationMinutes)}
            </span>
            <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent" />
            <span className="text-[11px] text-subtitle">
              {trip.stops === 0
                ? trip.mode === "flights"
                  ? "Direct"
                  : "Non-stop"
                : `${trip.stops} stop${trip.stops > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-title">{formatTime(trip.arriveAt)}</p>
            <p className="text-xs text-subtitle">{trip.destination.code}</p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-3 sm:w-48 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <div className="text-right">
            <p className="text-xl font-extrabold text-title">{formatMoney(trip.basePrice, trip.currency)}</p>
            <p className="text-[11px] text-subtitle">per person</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/book/${trip.id}?passengers=${passengers}`}>Select</Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {trip.seatsAvailable <= 8 && (
          <Badge tone="warning">{trip.seatsAvailable} seats left</Badge>
        )}
        {trip.amenities.map((a) => {
          const A = AMENITY_ICON[a];
          return (
            <span key={a} className="flex items-center gap-1 text-[11px] capitalize text-subtitle">
              {A && <A className="size-3.5" />} {a}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
