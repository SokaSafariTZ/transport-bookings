import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Spinner } from "@/components/ui";
import { BookFlow } from "./BookFlow";

export default async function BookPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="flex items-center gap-2 px-4 py-16 text-subtitle">
            <Spinner /> Loading…
          </div>
        }
      >
        <BookFlow tripId={tripId} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
