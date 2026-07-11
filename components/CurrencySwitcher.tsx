"use client";

import { cn } from "@/lib/utils";
import { useCurrency, type DisplayCurrency } from "@/lib/currency";

const OPTIONS: { value: DisplayCurrency; label: string }[] = [
  { value: "TZS", label: "TZS" },
  { value: "USD", label: "USD" },
];

export function CurrencySwitcher({
  className,
  compact = false,
}: {
  className?: string;
  /** Smaller pill for dense headers */
  compact?: boolean;
}) {
  const { displayCurrency, setDisplayCurrency, usdToTzs } = useCurrency();

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        role="group"
        aria-label="Display currency"
        className={cn(
          "inline-flex items-center rounded-full border border-line bg-input/80 p-0.5",
          className,
        )}
      >
        {OPTIONS.map((opt) => {
          const active = displayCurrency === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => setDisplayCurrency(opt.value)}
              className={cn(
                "rounded-full font-semibold transition",
                compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-subtitle hover:text-title",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <p className="px-1 text-[10px] text-muted">1 USD ≈ {Math.round(usdToTzs).toLocaleString()} TZS</p>
    </div>
  );
}
