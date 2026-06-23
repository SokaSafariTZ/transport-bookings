"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Ticket as TicketIcon } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, Input, Spinner, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Ticket } from "@/components/Ticket";

export function ManageLookup() {
  const initial = useSearchParams().get("ref") ?? "";
  const [input, setInput] = useState(initial);
  const [ref, setRef] = useState(initial);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["booking", ref],
    queryFn: () => api.getBooking(ref),
    enabled: Boolean(ref),
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-title">Find your booking</h1>
      <p className="mt-1 text-subtitle">Enter the 6-character PNR from your confirmation.</p>

      <Card className="mt-5 flex items-center gap-2 p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QX"
          className="border-0 bg-transparent font-mono uppercase tracking-widest focus:ring-0"
          onKeyDown={(e) => e.key === "Enter" && setRef(input.trim())}
        />
        <Button onClick={() => setRef(input.trim())}>
          <Search className="size-4" /> Find
        </Button>
      </Card>

      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center gap-2 text-subtitle">
            <Spinner /> Looking up {ref}…
          </div>
        )}
        {ref && isError && (
          <EmptyState
            title="No booking found"
            subtitle={`We couldn't find a booking for "${ref}".`}
            icon={<TicketIcon className="size-8" />}
          />
        )}
        {data && <Ticket booking={data} />}
      </div>
    </div>
  );
}
