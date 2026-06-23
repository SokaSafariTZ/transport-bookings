"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Plane, Bus, Search, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Field, Select, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TravelMode } from "@/lib/types";

const MODES: { key: TravelMode; label: string; icon: typeof Plane }[] = [
  { key: "flights", label: "Flights", icon: Plane },
  { key: "buses", label: "Buses", icon: Bus },
];

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function SearchForm({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<TravelMode>(
    (params.get("mode") as TravelMode) || "flights",
  );
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [date, setDate] = useState(params.get("date") ?? todayPlus(3));
  const [passengers, setPassengers] = useState(Number(params.get("passengers") ?? 1));

  const { data: catalog } = useQuery({
    queryKey: ["catalog", mode],
    queryFn: () => api.catalog(mode),
  });

  const locations = useMemo(() => catalog?.locations ?? [], [catalog]);

  // Default the from/to selects to the first valid pair for the mode.
  useEffect(() => {
    if (!locations.length) return;
    setFrom((f) => (locations.some((l) => l.code === f) ? f : locations[0].code));
    setTo((t) =>
      locations.some((l) => l.code === t) && t !== locations[0].code
        ? t
        : locations[1]?.code ?? "",
    );
  }, [locations]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit() {
    const q = new URLSearchParams({
      mode,
      from,
      to,
      date,
      passengers: String(passengers),
    });
    router.push(`/search?${q.toString()}`);
  }

  return (
    <div
      className={cn(
        "rounded-[24px] border border-line bg-card/90 p-4 shadow-2xl backdrop-blur-xl sm:p-5",
        embedded && "shadow-none",
      )}
    >
      {/* Mode switch */}
      <div className="mb-4 inline-flex rounded-full bg-input p-1">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-primary text-canvas shadow"
                  : "text-subtitle hover:text-title",
              )}
            >
              <Icon className="size-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_1fr_auto] sm:items-end">
        <Field label={mode === "flights" ? "From (airport)" : "From (terminal)"}>
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {locations.map((l) => (
              <option key={l.id} value={l.code}>
                {l.city} ({l.code})
              </option>
            ))}
          </Select>
        </Field>

        <button
          onClick={swap}
          className="mb-0.5 hidden size-11 shrink-0 items-center justify-center rounded-[14px] border border-line text-subtitle hover:text-primary sm:flex"
          aria-label="Swap"
          type="button"
        >
          <ArrowLeftRight className="size-4" />
        </button>

        <Field label="To">
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            {locations
              .filter((l) => l.code !== from)
              .map((l) => (
                <option key={l.id} value={l.code}>
                  {l.city} ({l.code})
                </option>
              ))}
          </Select>
        </Field>

        <Field label="Departure">
          <Input
            type="date"
            value={date}
            min={todayPlus(0)}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Travellers">
          <div className="flex h-11 items-center gap-2 rounded-[14px] border border-line bg-input px-3">
            <Users className="size-4 text-subtitle" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="bg-transparent text-sm text-title outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </Field>
      </div>

      <Button onClick={submit} size="lg" className="mt-4 w-full sm:w-auto sm:px-10">
        <Search className="size-4" />
        Search {mode}
      </Button>
    </div>
  );
}
