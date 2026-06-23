"use client";

import { cn } from "@/lib/utils";
import type { Seat } from "@/lib/types";

const POSITION_LABEL: Record<string, string> = {
  "window-left":  "Window",
  "middle-left":  "Middle",
  "aisle-left":   "Aisle",
  "aisle-right":  "Aisle",
  "middle-right": "Middle",
  "window-right": "Window",
};

export function SeatMap({
  seats,
  selected,
  maxSelect,
  onToggle,
  mode = "flights",
}: {
  seats: Seat[];
  selected: string[];
  maxSelect: number;
  onToggle: (seatNumber: string) => void;
  mode?: "flights" | "buses";
}) {
  const cols = [...new Set(seats.map((s) => s.col))].sort();
  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);
  const byKey = new Map(seats.map((s) => [`${s.row}${s.col}`, s]));
  const aisleAfter = mode === "buses" ? "B" : cols[Math.floor(cols.length / 2) - 1];

  return (
    <div className="rounded-[16px] border border-line bg-input/60 p-4">
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-subtitle">
        <Legend className="bg-card border border-line" label="Available" />
        <Legend className="bg-primary" label="Selected" />
        <Legend className="bg-white/10" label="Taken" />
        {mode === "buses" && <Legend className="border border-gold/40 bg-gold/10" label="VIP" />}
      </div>

      <div className="mx-auto w-fit">
        {/* Bus: driver + steering wheel at front */}
        {mode === "buses" && (
          <div className="mb-3 flex items-center justify-end pr-1">
            <div className="flex flex-col items-center gap-0.5 rounded-[8px] border border-line bg-card px-2.5 py-1.5 text-[10px] text-muted">
              <span className="text-base leading-none">🚌</span>
              <span>Driver</span>
            </div>
          </div>
        )}

        {/* Aircraft nose for flights */}
        {mode === "flights" && (
          <div className="mb-2 text-center text-[10px] uppercase tracking-widest text-muted">
            ✈ Front / Cockpit
          </div>
        )}

        {/* Column headers */}
        <div className="mb-1 flex items-center gap-1.5 pl-6">
          {cols.map((col) => (
            <span key={col} className="flex items-center">
              <span className="grid w-7 place-items-center text-[10px] font-semibold uppercase text-muted">
                {col}
              </span>
              {col === aisleAfter && <span className="w-3" />}
            </span>
          ))}
        </div>

        {/* Seat grid */}
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => {
            const rowSeats = seats.filter((s) => s.row === row);
            const isVipRow = rowSeats[0]?.fareClass === "vip" || rowSeats[0]?.fareClass === "business";
            const rowCols = [...new Set(rowSeats.map((s) => s.col))].sort();

            return (
              <div key={row} className={cn("flex items-center gap-1.5", isVipRow && "")}>
                <span
                  className={cn(
                    "w-5 text-right text-[10px]",
                    isVipRow ? "font-semibold text-gold" : "text-muted",
                  )}
                >
                  {row}
                </span>
                {rowCols.map((col) => {
                  const seat = byKey.get(`${row}${col}`);
                  if (!seat) return <span key={col} className="size-7" />;
                  const isSel = selected.includes(seat.number);
                  const taken = seat.status === "occupied";
                  const disabled = taken || (!isSel && selected.length >= maxSelect);
                  const posLabel = POSITION_LABEL[seat.position] ?? "";
                  const isVip = seat.fareClass === "vip" || seat.fareClass === "business";

                  return (
                    <span key={col} className="flex items-center">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggle(seat.number)}
                        title={`${seat.number} · ${seat.fareClass} · ${posLabel}`}
                        className={cn(
                          "grid size-7 place-items-center rounded-[7px] text-[10px] font-semibold transition",
                          taken && "cursor-not-allowed bg-white/10 text-muted",
                          !taken && !isSel && !isVip && "border border-line bg-card text-subtitle hover:border-primary/40 hover:bg-primary/20 hover:text-primary",
                          !taken && !isSel && isVip && "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/25",
                          isSel && "bg-primary text-canvas shadow-[0_0_10px_rgba(59,158,255,0.5)]",
                          disabled && !taken && "opacity-40",
                        )}
                      >
                        {col}
                      </button>
                      {col === aisleAfter && <span className="w-3" />}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Back label */}
        <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted">
          {mode === "buses" ? "Rear" : "Tail"}
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded", className)} /> {label}
    </span>
  );
}
