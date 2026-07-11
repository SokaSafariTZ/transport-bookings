"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plane, Bus, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, Field, Input, Select, Spinner, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { SeatMap } from "@/components/SeatMap";
import { formatDuration, formatTime, formatDate } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import type { FareClass } from "@/lib/types";
import {
  sanitizeDocumentNumber,
  sanitizeEmail,
  sanitizeNationality,
  sanitizePersonNameInput,
  sanitizePhone,
  validateBookingFormFields,
} from "@/lib/validation";

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
  const { formatAmount } = useCurrency();
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
  const [fieldErrors, setFieldErrors] = useState<{
    contact?: { email?: string; phone?: string };
    passengers: Record<
      number,
      Partial<Record<"fullName" | "documentNumber" | "nationality", string>>
    >;
  }>({ passengers: {} });

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
        contactEmail: sanitizeEmail(contact.email),
        contactPhone: sanitizePhone(contact.phone),
        passengers: pax.map((p, i) => {
          const nationality = sanitizeNationality(p.nationality);
          return {
            fullName: p.fullName.trim(),
            documentType: p.documentType,
            documentNumber: sanitizeDocumentNumber(p.documentNumber, p.documentType, nationality),
            nationality,
            fareClass: fare!.fareClass,
            seatNumber: seats[i],
          };
        }),
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
    pax.every((p) => p.fullName.trim() && p.documentNumber.trim() && p.nationality.trim()) &&
    contact.email.trim() &&
    contact.phone.trim();

  function toggleSeat(n: string) {
    setSeats((prev) =>
      prev.includes(n)
        ? prev.filter((s) => s !== n)
        : prev.length < paxCount
          ? [...prev, n]
          : prev,
    );
  }

  function submitBooking() {
    const validated = validateBookingFormFields({
      contactEmail: contact.email,
      contactPhone: contact.phone,
      passengers: pax,
    });
    if (!validated.ok) {
      setFieldErrors({
        contact: validated.contact,
        passengers: validated.passengers,
      });
      return;
    }
    setFieldErrors({ passengers: {} });
    create.mutate();
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
                  <p className="mt-1 text-lg font-bold text-title">{formatAmount(f.price)}</p>
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
                <Field label="Full name" error={fieldErrors.passengers[i]?.fullName}>
                  <Input
                    value={p.fullName}
                    onChange={(e) => updatePax(i, { fullName: sanitizePersonNameInput(e.target.value) })}
                    placeholder="As on travel document"
                    autoComplete="name"
                    maxLength={120}
                  />
                </Field>
                <Field label="Nationality (ISO)" error={fieldErrors.passengers[i]?.nationality}>
                  <Input
                    value={p.nationality}
                    onChange={(e) =>
                      updatePax(i, {
                        nationality: sanitizeNationality(e.target.value),
                        documentNumber: sanitizeDocumentNumber(
                          p.documentNumber,
                          p.documentType,
                          sanitizeNationality(e.target.value),
                        ),
                      })
                    }
                    placeholder="e.g. TZ"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </Field>
                <Field label="Document type">
                  <Select
                    value={p.documentType}
                    onChange={(e) => {
                      const documentType = e.target.value as PassengerForm["documentType"];
                      updatePax(i, {
                        documentType,
                        documentNumber: sanitizeDocumentNumber(
                          p.documentNumber,
                          documentType,
                          p.nationality,
                        ),
                      });
                    }}
                  >
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                  </Select>
                </Field>
                <Field label="Document number" error={fieldErrors.passengers[i]?.documentNumber}>
                  <Input
                    value={p.documentNumber}
                    onChange={(e) =>
                      updatePax(i, {
                        documentNumber: sanitizeDocumentNumber(
                          e.target.value,
                          p.documentType,
                          p.nationality,
                        ),
                      })
                    }
                    placeholder={
                      p.documentType === "national_id" && p.nationality === "TZ"
                        ? "20-digit NIDA"
                        : "e.g. AB1234567"
                    }
                    maxLength={p.documentType === "national_id" && p.nationality === "TZ" ? 20 : 12}
                    autoCapitalize="characters"
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
              <Field label="Email" error={fieldErrors.contact?.email}>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, email: sanitizeEmail(e.target.value) }))
                  }
                  autoComplete="email"
                  maxLength={255}
                />
              </Field>
              <Field label="Phone" error={fieldErrors.contact?.phone}>
                <Input
                  value={contact.phone}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, phone: sanitizePhone(e.target.value) }))
                  }
                  placeholder="+255712345678"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={16}
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
            <Row label={`${fare?.label ?? "Fare"} × ${paxCount}`} value={formatAmount((fare?.price ?? 0) * paxCount)} />
            <Row label="Taxes & fees" value="Included" muted />
            <div className="my-2 h-px bg-line" />
            <Row label="Total" value={formatAmount(total)} bold />
          </div>
          {create.isError && (
            <p className="mt-3 text-xs text-danger">{(create.error as Error).message}</p>
          )}
          <Button
            className="mt-4 w-full"
            disabled={!canSubmit || create.isPending}
            onClick={submitBooking}
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
    setFieldErrors((prev) => {
      if (!prev.passengers[i]) return prev;
      const nextPax = { ...prev.passengers };
      const cleared = { ...nextPax[i] };
      for (const key of Object.keys(patch) as Array<keyof PassengerForm>) {
        if (key === "fullName" || key === "documentNumber" || key === "nationality") {
          delete cleared[key];
        }
      }
      if (Object.keys(cleared).length === 0) delete nextPax[i];
      else nextPax[i] = cleared;
      return { ...prev, passengers: nextPax };
    });
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
