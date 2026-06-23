"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, Smartphone, Wallet, Lock } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, Field, Input, Spinner, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { formatMoney, formatDate } from "@/lib/utils";

const METHODS = [
  { key: "card", label: "Card", icon: CreditCard },
  { key: "mobile_money", label: "Mobile money", icon: Smartphone },
  { key: "wallet", label: "SokaSafari Wallet", icon: Wallet },
] as const;

export function CheckoutFlow() {
  const router = useRouter();
  const ref = useSearchParams().get("ref") ?? "";
  const [method, setMethod] = useState<(typeof METHODS)[number]["key"]>("card");

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", ref],
    queryFn: () => api.getBooking(ref),
    enabled: Boolean(ref),
  });

  const pay = useMutation({
    mutationFn: () => api.pay(ref, method),
    onSuccess: () => router.push(`/confirmation/${ref}`),
  });

  if (isLoading)
    return (
      <div className="flex items-center gap-2 px-4 py-20 text-subtitle">
        <Spinner /> Loading booking…
      </div>
    );
  if (!booking) return <p className="py-20 text-center text-subtitle">Booking not found.</p>;

  return (
    <div className="mx-auto max-w-4xl gap-6 px-4 py-8 md:grid md:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-title">Secure checkout</h1>
          <p className="text-sm text-subtitle">
            Booking <span className="font-mono font-semibold text-primary">{booking.pnr}</span> ·{" "}
            held for you
          </p>
        </div>

        <Card className="p-4">
          <p className="mb-3 text-sm font-semibold text-title">Payment method</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`flex flex-col items-center gap-1.5 rounded-[14px] border p-3 text-sm transition ${
                  method === m.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-line text-subtitle hover:border-line-strong"
                }`}
              >
                <m.icon className="size-5" />
                {m.label}
              </button>
            ))}
          </div>

          {method === "card" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Card number" className="sm:col-span-2">
                <Input placeholder="4242 4242 4242 4242" inputMode="numeric" />
              </Field>
              <Field label="Expiry">
                <Input placeholder="MM/YY" />
              </Field>
              <Field label="CVC">
                <Input placeholder="123" inputMode="numeric" />
              </Field>
            </div>
          )}
          {method === "mobile_money" && (
            <Field label="Phone number" className="mt-4">
              <Input placeholder="+254 7XX XXX XXX" />
            </Field>
          )}
          {method === "wallet" && (
            <p className="mt-4 rounded-[12px] bg-input p-3 text-sm text-subtitle">
              Pay instantly from your SokaSafari Wallet balance.
            </p>
          )}

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
            <Lock className="size-3" /> This is a sandbox. No real charge is made.
          </p>
        </Card>
      </div>

      <aside>
        <Card className="sticky top-20 p-4">
          <p className="text-sm font-semibold text-title">{booking.trip.operator.name}</p>
          <p className="text-xs text-subtitle">
            {booking.trip.origin.city} → {booking.trip.destination.city}
          </p>
          <p className="mt-1 text-xs text-subtitle">{formatDate(booking.trip.departAt)}</p>
          <Badge tone="info" className="mt-2 capitalize">
            {booking.mode} · {booking.passengerCount} pax
          </Badge>
          <div className="my-3 h-px bg-line" />
          <div className="flex justify-between text-sm">
            <span className="text-subtitle">Total</span>
            <span className="text-lg font-bold text-title">
              {formatMoney(booking.totalAmount, booking.currency)}
            </span>
          </div>
          {pay.isError && (
            <p className="mt-2 text-xs text-danger">{(pay.error as Error).message}</p>
          )}
          <Button
            className="mt-4 w-full"
            disabled={pay.isPending}
            onClick={() => pay.mutate()}
          >
            {pay.isPending ? <Spinner /> : `Pay ${formatMoney(booking.totalAmount)}`}
          </Button>
        </Card>
      </aside>
    </div>
  );
}
