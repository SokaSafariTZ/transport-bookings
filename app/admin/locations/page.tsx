"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Plane, Bus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Field, Input, Select, Spinner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import type { Location } from "@/lib/types";

const blank: Omit<Location, "id"> = {
  code: "",
  name: "",
  city: "",
  country: "",
  countryCode: "",
  type: "airport",
};

export default function AdminLocations() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Omit<Location, "id"> & { id?: string }) | null>(null);

  const { data, isLoading } = useQuery<Location[]>({
    queryKey: ["admin-locations"],
    queryFn: async () => (await (await fetch("/api/v1/admin/locations")).json()).data,
  });

  const save = useMutation({
    mutationFn: async (loc: Omit<Location, "id"> & { id?: string }) => {
      const url = loc.id ? `/api/v1/admin/locations/${loc.id}` : "/api/v1/admin/locations";
      const res = await fetch(url, {
        method: loc.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loc),
      });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-locations"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/admin/locations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-locations"] }),
  });

  return (
    <>
      <AdminHeader
        title="Locations"
        subtitle="Airports & bus terminals"
        action={
          <Button size="sm" onClick={() => setEditing({ ...blank })}>
            <Plus className="size-4" /> Add location
          </Button>
        }
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="flex items-center gap-2 p-6 text-subtitle">
              <Spinner /> Loading…
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data?.map((loc) => (
                  <tr key={loc.id} className="border-b border-line/60">
                    <td className="px-4 py-3 font-mono text-primary">{loc.code}</td>
                    <td className="px-4 py-3 text-title">{loc.name}</td>
                    <td className="px-4 py-3 text-subtitle">{loc.city}</td>
                    <td className="px-4 py-3 text-subtitle">{loc.country}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-subtitle">
                        {loc.type === "airport" ? <Plane className="size-4" /> : <Bus className="size-4" />}
                        {loc.type === "airport" ? "Airport" : "Terminal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditing(loc)} className="mr-2 text-subtitle hover:text-primary">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove.mutate(loc.id)} className="text-subtitle hover:text-danger">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {editing && (
          <Card className="h-fit p-4">
            <h2 className="mb-3 font-semibold text-title">
              {editing.id ? "Edit location" : "New location"}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code">
                  <Input
                    value={editing.code}
                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  />
                </Field>
                <Field label="Type">
                  <Select
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value as Location["type"] })}
                  >
                    <option value="airport">Airport</option>
                    <option value="bus_terminal">Bus terminal</option>
                  </Select>
                </Field>
              </div>
              <Field label="Name">
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="City">
                <Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">
                  <Input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
                </Field>
                <Field label="Country code">
                  <Input
                    maxLength={2}
                    value={editing.countryCode}
                    onChange={(e) => setEditing({ ...editing, countryCode: e.target.value.toUpperCase() })}
                  />
                </Field>
              </div>
              {save.isError && <p className="text-xs text-danger">{(save.error as Error).message}</p>}
              <div className="flex gap-2 pt-1">
                <Button className="flex-1" onClick={() => save.mutate(editing)} disabled={save.isPending}>
                  {save.isPending ? <Spinner /> : "Save"}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
