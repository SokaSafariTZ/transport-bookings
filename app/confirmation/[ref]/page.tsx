import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Ticket } from "@/components/Ticket";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui";
import { getBooking } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const booking = getBooking(ref);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-xl px-4 py-10">
        {!booking ? (
          <EmptyState
            title="Booking not found"
            subtitle="This reference may have expired (the demo store resets when the server restarts)."
          />
        ) : (
          <>
            <div className="mb-6 text-center">
              <CheckCircle2 className="mx-auto size-12 text-success" />
              <h1 className="mt-3 text-2xl font-bold text-title">
                {booking.paymentStatus === "paid" ? "You're booked!" : "Booking created"}
              </h1>
              <p className="mt-1 text-subtitle">
                A confirmation was sent to {booking.contactEmail}.
              </p>
            </div>
            <Ticket booking={booking} />
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="size-4" /> Home
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/manage?ref=${booking.pnr}`}>View in my trips</Link>
              </Button>
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
