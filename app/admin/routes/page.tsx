"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plane, Bus, Save } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Input, Spinner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { formatMoneyDual, formatTzs, usdToTzsCash } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

type AdminRouteRow = {
  key: string;
  mode: "flights" | "buses";
  originCode: string;
  destCode: string;
  originCity: string;
  destCity: string;
  minutes: number;
  daily: number;
  basePrice: number;
  basePriceTzs: number;
  priceLabel: string;
  operators: string[];
};

export default function AdminRoutes() {
  const qc = useQueryClient();
  const { usdToTzs } = useCurrency();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<AdminRouteRow[]>({
    queryKey: ["admin-routes"],
    queryFn: async () => (await (await fetch("/api/v1/admin/routes")).json()).data,
  });

  const save = useMutation({
    mutationFn: async ({ key, basePrice }: { key: string; basePrice: number }) => {
      const res = await fetch("/api/v1/admin/routes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, basePrice }),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-routes"] });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[vars.key];
        return next;
      });
    },
  });

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <>
      <AdminHeader
        title="Routes & fares"
        subtitle="Set the published USD base fare for each route. Travellers see this exact price (USD + TZS) in search and booking — no random markup."
      />
      <div className="p-6">
        <Card className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="flex items-center gap-2 p-6 text-subtitle">
              <Spinner /> Loading…
            </div>
          ) : (
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Operators</th>
                  <th className="px-4 py-3 font-medium">Base fare (USD)</th>
                  <th className="px-4 py-3 font-medium">TZS equiv.</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const draft = drafts[r.key];
                  const value = draft ?? String(r.basePrice);
                  const parsed = Number(value);
                  const dirty = draft != null && Number.isFinite(parsed) && parsed !== r.basePrice;
                  const tzsPreview = Number.isFinite(parsed) && parsed > 0
                    ? formatTzs(usdToTzsCash(parsed, usdToTzs))
                    : formatTzs(usdToTzsCash(r.basePrice, usdToTzs));

                  return (
                    <tr key={r.key} className="border-b border-line/60">
                      <td className="px-4 py-3">
                        {r.mode === "flights" ? (
                          <Plane className="size-4 text-primary" />
                        ) : (
                          <Bus className="size-4 text-gold" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-title">
                        {r.originCity} → {r.destCity}
                        <p className="text-[11px] text-muted">
                          {r.originCode} → {r.destCode}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-subtitle">{r.operators.join(", ")}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="w-28"
                          value={value}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [r.key]: e.target.value }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-title">
                        {tzsPreview}
                        <p className="text-[11px] font-normal text-muted">
                          {formatMoneyDual(Number.isFinite(parsed) && parsed > 0 ? parsed : r.basePrice, usdToTzs)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          disabled={!dirty || save.isPending}
                          onClick={() => save.mutate({ key: r.key, basePrice: parsed })}
                        >
                          <Save className="size-3.5" /> Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
