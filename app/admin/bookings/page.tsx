"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Badge, Spinner, Select, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/utils";
import type { BookingDetail, BookingStatus } from "@/lib/types";

async function fetchBookings(): Promise<BookingDetail[]> {
  const res = await fetch("/api/v1/admin/bookings");
  if (!res.ok) throw new Error("Failed to load");
  return (await res.json()).data;
}

export default function AdminBookings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: fetchBookings });

  const patch = useMutation({
    mutationFn: async ({ ref, status }: { ref: string; status: BookingStatus }) => {
      const res = await fetch(`/api/v1/admin/bookings/${ref}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  return (
    <>
      <AdminHeader title="Bookings" subtitle="All reservations across flights & buses" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-subtitle">
            <Spinner /> Loading…
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState title="No bookings yet" subtitle="Bookings made on the site appear here." />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">PNR</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Pax</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((b) => (
                  <tr key={b.id} className="border-b border-line/60">
                    <td className="px-4 py-3 font-mono text-primary">{b.pnr}</td>
                    <td className="px-4 py-3 capitalize text-subtitle">{b.mode}</td>
                    <td className="px-4 py-3 text-title">
                      {b.trip.origin.code} → {b.trip.destination.code}
                    </td>
                    <td className="px-4 py-3 text-subtitle">{formatDate(b.trip.departAt)}</td>
                    <td className="px-4 py-3 text-subtitle">{b.passengerCount}</td>
                    <td className="px-4 py-3">
                      <Badge tone={b.paymentStatus === "paid" ? "success" : "warning"}>
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-title">
                      {formatMoney(b.totalAmount, b.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={b.status}
                        className="h-9 w-36"
                        disabled={patch.isPending}
                        onChange={(e) =>
                          patch.mutate({ ref: b.pnr, status: e.target.value as BookingStatus })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}
