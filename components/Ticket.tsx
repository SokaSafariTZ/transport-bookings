import { Plane, Bus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDate, formatTime, formatDuration, formatMoneyDual } from "@/lib/utils";
import type { BookingDetail } from "@/lib/types";

export function Ticket({ booking }: { booking: BookingDetail }) {
  const { trip } = booking;
  const Icon = trip.mode === "flights" ? Plane : Bus;
  const paid = booking.paymentStatus === "paid";

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-card shadow-2xl">
      {/* Header band */}
      <div
        className="flex items-center justify-between px-5 py-4 text-white"
        style={{ backgroundColor: trip.operator.logoColor }}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="size-5" />
          <span className="font-bold">{trip.operator.name}</span>
        </div>
        <span className="font-mono text-sm opacity-90">{trip.serviceNumber}</span>
      </div>

      {/* Route */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 py-6">
        <div>
          <p className="text-3xl font-extrabold text-title">{trip.origin.code}</p>
          <p className="text-xs text-subtitle">{trip.origin.city}</p>
          <p className="mt-1 text-sm font-semibold text-title">{formatTime(trip.departAt)}</p>
        </div>
        <div className="flex flex-col items-center text-subtitle">
          <span className="text-[11px]">{formatDuration(trip.durationMinutes)}</span>
          <ArrowRight className="my-1 size-5 text-primary" />
          <span className="text-[11px]">{trip.stops === 0 ? "Direct" : `${trip.stops} stop(s)`}</span>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-title">{trip.destination.code}</p>
          <p className="text-xs text-subtitle">{trip.destination.city}</p>
          <p className="mt-1 text-sm font-semibold text-title">{formatTime(trip.arriveAt)}</p>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative border-t border-dashed border-line-strong">
        <span className="absolute -left-3 -top-3 size-6 rounded-full bg-canvas" />
        <span className="absolute -right-3 -top-3 size-6 rounded-full bg-canvas" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-4">
        <Detail label="PNR" value={booking.pnr} mono />
        <Detail label="Date" value={formatDate(trip.departAt)} />
        <Detail label="Travellers" value={String(booking.passengerCount)} />
        <Detail label="Total" value={formatMoneyDual(booking.totalAmount)} />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone={paid ? "success" : "warning"}>
            {paid ? "Paid · Confirmed" : "Awaiting payment"}
          </Badge>
          <Badge tone="neutral" className="capitalize">
            {booking.status}
          </Badge>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="pb-1 font-medium">Passenger</th>
              <th className="pb-1 font-medium">Seat</th>
              <th className="pb-1 font-medium">Class</th>
            </tr>
          </thead>
          <tbody>
            {booking.passengers.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="py-2 text-title">{p.fullName}</td>
                <td className="py-2 font-mono text-primary">{p.seatNumber ?? "—"}</td>
                <td className="py-2 capitalize text-subtitle">{p.fareClass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className={`font-semibold text-title ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
