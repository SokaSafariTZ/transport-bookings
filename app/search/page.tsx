import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "./SearchResults";
import { Spinner } from "@/components/ui";

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <div className="border-b border-line bg-canvas/60">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Suspense fallback={<div className="h-44 rounded-[24px] bg-card/60" />}>
            <SearchForm embedded />
          </Suspense>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center gap-2 px-4 py-16 text-subtitle">
            <Spinner /> Loading…
          </div>
        }
      >
        <SearchResults />
      </Suspense>
      <SiteFooter />
    </>
  );
}
