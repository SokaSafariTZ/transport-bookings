"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Plane, Bus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Field, Input, Select, Spinner, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import type { Operator } from "@/lib/types";

const blank: Omit<Operator, "id"> = {
  code: "",
  name: "",
  mode: "flights",
  logoColor: "#3B9EFF",
  rating: 4,
};

export default function AdminOperators() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Operator | (Omit<Operator, "id"> & { id?: string })) | null>(null);

  const { data, isLoading } = useQuery<Operator[]>({
    queryKey: ["admin-operators"],
    queryFn: async () => (await (await fetch("/api/v1/admin/operators")).json()).data,
  });

  const save = useMutation({
    mutationFn: async (op: Omit<Operator, "id"> & { id?: string }) => {
      const url = op.id ? `/api/v1/admin/operators/${op.id}` : "/api/v1/admin/operators";
      const res = await fetch(url, {
        method: op.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op),
      });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-operators"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/admin/operators/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-operators"] }),
  });

  return (
    <>
      <AdminHeader
        title="Operators"
        subtitle="Airlines & coach lines"
        action={
          <Button size="sm" onClick={() => setEditing({ ...blank })}>
            <Plus className="size-4" /> Add operator
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
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Operator</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data?.map((op) => (
                  <tr key={op.id} className="border-b border-line/60">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="grid size-7 place-items-center rounded-lg text-white"
                          style={{ backgroundColor: op.logoColor }}
                        >
                          {op.mode === "flights" ? <Plane className="size-4" /> : <Bus className="size-4" />}
                        </span>
                        <span className="font-medium text-title">{op.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-subtitle">{op.code}</td>
                    <td className="px-4 py-3 capitalize text-subtitle">{op.mode}</td>
                    <td className="px-4 py-3 text-subtitle">★ {op.rating}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(op)}
                        className="mr-2 text-subtitle hover:text-primary"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => remove.mutate(op.id)}
                        className="text-subtitle hover:text-danger"
                      >
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
              {"id" in editing && editing.id ? "Edit operator" : "New operator"}
            </h2>
            <div className="space-y-3">
              <Field label="Name">
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code">
                  <Input
                    value={editing.code}
                    maxLength={4}
                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  />
                </Field>
                <Field label="Mode">
                  <Select
                    value={editing.mode}
                    onChange={(e) => setEditing({ ...editing, mode: e.target.value as Operator["mode"] })}
                  >
                    <option value="flights">Flights</option>
                    <option value="buses">Buses</option>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Brand colour">
                  <Input
                    type="color"
                    value={editing.logoColor}
                    onChange={(e) => setEditing({ ...editing, logoColor: e.target.value })}
                    className="h-11 p-1"
                  />
                </Field>
                <Field label="Rating">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editing.rating}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
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
