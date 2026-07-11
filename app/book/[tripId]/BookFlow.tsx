"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plane, Bus, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, Field, Input, Select, Spinner, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { SeatMap } from "@/components/SeatMap";
import { formatDuration, formatMoneyDual, formatTime, formatDate } from "@/lib/utils";
import type { FareClass } from "@/lib/types";

interface PassengerForm {
  fullName: string;
  documentNumber: string;
  nationality: string;
  documentType: "passport" | "national_id";
}

const empty: PassengerForm = {
  fullName: "",
  documentNumber: "",
  nationality: "",
  documentType: "passport",
};

export function BookFlow({ tripId }: { tripId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const paxCount = Math.max(1, Number(params.get("passengers") ?? 1));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.trip(tripId),
  });

  const [fareClass, setFareClass] = useState<FareClass | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [pax, setPax] = useState<PassengerForm[]>(
    Array.from({ length: paxCount }, () => ({ ...empty })),
  );
  const [contact, setContact] = useState({ email: "", phone: "" });

  const fare = useMemo(
    () => data?.fares.find((f) => f.fareClass === fareClass) ?? data?.fares[0],
    [data, fareClass],
  );

  const seatsForFare = useMemo(
    () => (data?.seats ?? []).filter((s) => (fare ? s.fareClass === fare.fareClass : true)),
    [data, fare],
  );

  const create = useMutation({
    mutationFn: () =>
      api.createBooking({
        tripId,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        passengers: pax.map((p, i) => ({
          ...p,
          fareClass: fare!.fareClass,
          seatNumber: seats[i],
        })),
      }),
    onSuccess: (booking) => router.push(`/checkout?ref=${booking.pnr}`),
  });

  if (isLoading)
    return (
      <div className="flex items-center gap-2 py-20 text-subtitle">
        <Spinner /> Loading trip…
      </div>
    );
  if (isError || !data) return <p className="py-20 text-center text-subtitle">Trip not found.</p>;

  const { trip } = data;
  const Icon = trip.mode === "flights" ? Plane : Bus;
  const total = (fare?.price ?? trip.basePrice) * paxCount;
  const canSubmit =
    fare &&
    seats.length === paxCount &&
    pax.every((p) => p.fullName && p.documentNumber && p.nationality) &&
    contact.email &&
    contact.phone;

  function toggleSeat(n: string) {
    setSeats((prev) =>
      prev.includes(n)
        ? prev.filter((s) => s !== n)
        : prev.length < paxCount
          ? [...prev, n]
          : prev,
    );
  }

  return (
    <div className="mx-auto max-w-6xl gap-6 px-4 py-6 lg:grid lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* Trip summary */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-[12px] text-white"
              style={{ backgroundColor: trip.operator.logoColor }}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-title">{trip.operator.name}</p>
              <p className="text-xs text-subtitle">
                {trip.serviceNumber} · {formatDate(trip.departAt)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <b className="text-title">{formatTime(trip.departAt)}</b>
            <span className="text-subtitle">{trip.origin.city} ({trip.origin.code})</span>
            <ArrowRight className="size-4 text-muted" />
            <b className="text-title">{formatTime(trip.arriveAt)}</b>
            <span className="text-subtitle">{trip.destination.city} ({trip.destination.code})</span>
            <Badge tone="info">{formatDuration(trip.durationMinutes)}</Badge>
          </div>
        </Card>

        {/* Fare classes */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-title">1 · Choose a fare</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.fares.map((f) => {
              const active = (fare?.fareClass ?? data.fares[0].fareClass) === f.fareClass;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFareClass(f.fareClass);
                    setSeats([]);
                  }}
                  className={`rounded-[14px] border p-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "border-line bg-card hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-title">{f.label}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </div>
                  <p className="mt-1 text-lg font-bold text-title">{formatMoneyDual(f.price)}</p>
                  <p className="text-[11px] text-subtitle">
                    {f.baggageKg}kg · {f.refundable ? "Refundable" : "Non-refundable"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Seat selection */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-title">
            2 · Pick {paxCount} seat{paxCount > 1 ? "s" : ""}{" "}
            <span className="text-subtitle">({seats.join(", ") || "none selected"})</span>
          </h2>
          <SeatMap
            seats={seatsForFare}
            selected={seats}
            maxSelect={paxCount}
            onToggle={toggleSeat}
            mode={data?.trip.mode}
          />
        </section>

        {/* Passenger details */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-title">3 · Traveller details</h2>
          {pax.map((p, i) => (
            <Card key={i} className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtitle">
                Traveller {i + 1} {seats[i] && <span className="text-primary">· seat {seats[i]}</span>}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <Input
                    value={p.fullName}
                    onChange={(e) => updatePax(i, { fullName: e.target.value })}
                    placeholder="As on travel document"
                  />
                </Field>
                <Field label="Nationality">
                  <Input
                    value={p.nationality}
                    onChange={(e) => updatePax(i, { nationality: e.target.value })}
                    placeholder="e.g. Kenyan"
                  />
                </Field>
                <Field label="Document type">
                  <Select
                    value={p.documentType}
                    onChange={(e) =>
                      updatePax(i, { documentType: e.target.value as PassengerForm["documentType"] })
                    }
                  >
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                  </Select>
                </Field>
                <Field label="Document number">
                  <Input
                    value={p.documentNumber}
                    onChange={(e) => updatePax(i, { documentNumber: e.target.value })}
                  />
                </Field>
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtitle">
              Contact details
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email">
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={contact.phone}
                  onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                />
              </Field>
            </div>
          </Card>
        </section>
      </div>

      {/* Summary sidebar */}
      <aside className="mt-6 lg:mt-0">
        <Card className="sticky top-20 p-4">
          <p className="text-sm font-semibold text-title">Price summary</p>
          <div className="mt-3 space-y-2 text-sm">
            <Row label={`${fare?.label ?? "Fare"} × ${paxCount}`} value={formatMoneyDual((fare?.price ?? 0) * paxCount)} />
            <Row label="Taxes & fees" value="Included" muted />
            <div className="my-2 h-px bg-line" />
            <Row label="Total" value={formatMoneyDual(total)} bold />
          </div>
          {create.isError && (
            <p className="mt-3 text-xs text-danger">{(create.error as Error).message}</p>
          )}
          <Button
            className="mt-4 w-full"
            disabled={!canSubmit || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? <Spinner /> : "Continue to payment"}
          </Button>
          {!canSubmit && (
            <p className="mt-2 text-center text-[11px] text-muted">
              Select a fare, {paxCount} seat{paxCount > 1 ? "s" : ""}, and fill all traveller fields.
            </p>
          )}
        </Card>
      </aside>
    </div>
  );

  function updatePax(i: number, patch: Partial<PassengerForm>) {
    setPax((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted" : "text-subtitle"}>{label}</span>
      <span className={bold ? "font-bold text-title" : "text-title"}>{value}</span>
    </div>
  );
}
