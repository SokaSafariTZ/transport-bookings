import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Spinner } from "@/components/ui";
import { ManageLookup } from "./ManageLookup";

export default function ManagePage() {
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
        <ManageLookup />
      </Suspense>
      <SiteFooter />
    </>
  );
}
