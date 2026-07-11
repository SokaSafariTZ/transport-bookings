"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge, Select, Spinner, EmptyState } from "@/components/ui";
import { formatDate, formatDuration, formatTime } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import type { BookingDetail, BookingStatus } from "@/lib/types";

async function fetchBooking(ref: string): Promise<BookingDetail> {
  const res = await fetch(`/api/v1/admin/bookings/${encodeURIComponent(ref)}`);
  if (!res.ok) throw new Error("Failed to load booking");
  return (await res.json()).data;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Kv({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[13px] font-semibold text-subtitle">{label}</dt>
      <dd className="m-0 text-right text-sm font-bold text-title">{children}</dd>
    </div>
  );
}

export default function AdminBookingDetailPage() {
  const params = useParams<{ ref: string }>();
  const ref = decodeURIComponent(params.ref ?? "");
  const router = useRouter();
  const qc = useQueryClient();
  const { formatAmount } = useCurrency();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["admin-booking", ref],
    queryFn: () => fetchBooking(ref),
    enabled: Boolean(ref),
  });

  const patch = useMutation({
    mutationFn: async (status: BookingStatus) => {
      const res = await fetch(`/api/v1/admin/bookings/${encodeURIComponent(ref)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      return (await res.json()).data as BookingDetail;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["admin-booking", ref], updated);
      void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Booking" subtitle="Loading ticket…" />
        <div className="flex items-center gap-2 p-6 text-subtitle">
          <Spinner /> Loading…
        </div>
      </>
    );
  }

  if (isError || !booking) {
    return (
      <>
        <AdminHeader title="Booking" />
        <div className="p-6">
          <EmptyState
            title="Booking not found"
            subtitle="This PNR may have been removed or you do not have access."
          />
          <Link href="/admin/bookings" className="mt-4 inline-flex text-sm font-semibold text-primary">
            ← Back to bookings
          </Link>
        </div>
      </>
    );
  }

  const trip = booking.trip;
  const paid = booking.paymentStatus === "paid";
  const modeLabel = booking.mode === "flights" ? "Flights" : "Buses";
  const routeLabel = `${trip.origin.city} → ${trip.destination.city}`;
  const vehicleService = [trip.vehicle, trip.serviceNumber].filter(Boolean).join(" · ");
  const primaryPassenger = booking.passengers[0]?.fullName ?? booking.contactEmail;
  const guestInitials = initials(primaryPassenger) || "T";
  const amenities = trip.amenities?.length ? trip.amenities.join(", ") : null;
  const stopsLabel = trip.stops === 0 ? "Direct" : String(trip.stops);

  return (
    <>
      <AdminHeader
        title="Ticket"
        subtitle={`${modeLabel} · ${booking.pnr}`}
        action={
          <button
            type="button"
            onClick={() => router.push("/admin/bookings")}
            className="inline-flex items-center gap-1.5 rounded-[12px] border border-line bg-card px-3 py-2 text-sm font-semibold text-title transition hover:bg-muted/40"
          >
            <ArrowLeft className="size-4" />
            Bookings
          </button>
        }
      />

      <div className="space-y-4 p-6">
        {/* Hero — mirrors Filament transport ticket */}
        <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0d47a1] via-[#1565C0] to-[#1e88e5] px-6 py-6 text-[#e3f2fd] shadow-[0_18px_42px_rgba(13,71,161,0.28)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.18),transparent_45%)]" />
          <div className="relative z-[1] grid gap-4 md:grid-cols-[1.4fr_auto] md:items-end">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
                {modeLabel} ticket
              </p>
              <h2 className="mt-1.5 text-[1.55rem] font-extrabold tracking-tight text-white">
                {routeLabel}
              </h2>
              <p className="mt-1.5 text-sm opacity-90">
                {trip.operator.name}
                {booking.pnr ? ` · PNR ${booking.pnr}` : null}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-white/16 px-2.5 py-1 text-xs font-semibold">
                  {booking.id}
                </span>
                <span className="inline-flex rounded-full bg-white/16 px-2.5 py-1 text-xs font-semibold">
                  {formatDateTime(trip.departAt)}
                </span>
                <span className="inline-flex rounded-full bg-white/16 px-2.5 py-1 text-xs font-semibold">
                  Arr {formatDateTime(trip.arriveAt)}
                </span>
                {vehicleService ? (
                  <span className="inline-flex rounded-full bg-white/16 px-2.5 py-1 text-xs font-semibold">
                    {vehicleService}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-[1.85rem] font-extrabold leading-none text-white">
                {formatAmount(booking.totalAmount)}
              </div>
              <div className="mt-1.5 text-xs opacity-80">
                {paid ? "Paid fare" : "Fare due"}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3.5 md:grid-cols-2">
          <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h3 className="mb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-subtitle">
              Traveller contact
            </h3>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#e3f2fd] text-sm font-extrabold text-[#1565C0]">
                {guestInitials}
              </span>
              <div>
                <h4 className="m-0 text-base font-bold text-title">{primaryPassenger}</h4>
                <p className="m-0 mt-0.5 text-[13px] text-subtitle">{booking.contactEmail}</p>
              </div>
            </div>
            <dl className="grid gap-2.5">
              {booking.contactPhone ? (
                <Kv label="Phone">{booking.contactPhone}</Kv>
              ) : null}
              <Kv label="Status">
                <span className="inline-flex rounded-full bg-[#e3f2fd] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#1565C0]">
                  {booking.status}
                </span>
              </Kv>
              <Kv label="Payment">
                <Badge tone={paid ? "success" : "warning"}>{booking.paymentStatus}</Badge>
              </Kv>
              <Kv label="Booked on">{formatDateTime(booking.createdAt)}</Kv>
              <Kv label="Update status">
                <Select
                  value={booking.status}
                  className="h-9 w-36"
                  disabled={patch.isPending}
                  onChange={(e) => patch.mutate(e.target.value as BookingStatus)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Kv>
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h3 className="mb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-subtitle">
              Trip details
            </h3>
            <dl className="grid gap-2.5">
              <Kv label="Mode">{modeLabel}</Kv>
              <Kv label="Operator">{trip.operator.name}</Kv>
              <Kv label="From">
                {trip.origin.city} ({trip.origin.code})
              </Kv>
              <Kv label="To">
                {trip.destination.city} ({trip.destination.code})
              </Kv>
              <Kv label="Departure">{formatDateTime(trip.departAt)}</Kv>
              <Kv label="Arrival">{formatDateTime(trip.arriveAt)}</Kv>
              <Kv label="Duration">{formatDuration(trip.durationMinutes)}</Kv>
              {vehicleService ? <Kv label="Vehicle / service">{vehicleService}</Kv> : null}
              <Kv label="Stops">{stopsLabel}</Kv>
              {amenities ? <Kv label="Amenities">{amenities}</Kv> : null}
              <Kv label="Amount">{formatAmount(booking.totalAmount)}</Kv>
              <Kv label="PNR">
                <span className="font-mono">{booking.pnr}</span>
              </Kv>
              <Kv label="Booking id">
                <span className="font-mono text-xs">{booking.id}</span>
              </Kv>
              <Kv label="Date">{formatDate(trip.departAt)} · {formatTime(trip.departAt)}</Kv>
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5 shadow-sm md:col-span-2">
            <h3 className="mb-3.5 text-[11px] font-extrabold uppercase tracking-wider text-subtitle">
              Passengers on ticket
            </h3>
            {booking.passengers.length === 0 ? (
              <p className="m-0 text-sm text-subtitle">No passenger details stored on this booking.</p>
            ) : (
              <div className="space-y-4">
                {booking.passengers.map((p) => (
                  <div key={p.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <div className="mb-2 text-[15px] font-bold text-title">{p.fullName}</div>
                    <dl className="grid gap-2.5 sm:grid-cols-2">
                      {p.seatNumber ? <Kv label="Seat">{p.seatNumber}</Kv> : null}
                      <Kv label="Fare class">
                        <span className="capitalize">{p.fareClass}</span>
                      </Kv>
                      {p.documentNumber ? (
                        <Kv label="ID / passport">
                          {p.documentType}: {p.documentNumber}
                        </Kv>
                      ) : null}
                      {p.nationality ? <Kv label="Nationality">{p.nationality}</Kv> : null}
                      {p.email ? <Kv label="Email">{p.email}</Kv> : null}
                      {p.phone ? <Kv label="Phone">{p.phone}</Kv> : null}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
