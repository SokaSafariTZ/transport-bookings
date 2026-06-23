import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Spinner } from "@/components/ui";
import { CheckoutFlow } from "./CheckoutFlow";

export default function CheckoutPage() {
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
        <CheckoutFlow />
      </Suspense>
      <SiteFooter />
    </>
  );
}
