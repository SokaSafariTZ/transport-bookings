"use client";

import { useCurrency } from "@/lib/currency";

/** Renders a USD amount in the visitor's preferred display currency (TZS or USD). */
export function Money({
  amountUsd,
  className,
}: {
  amountUsd: number;
  className?: string;
}) {
  const { formatAmount } = useCurrency();
  return <span className={className}>{formatAmount(amountUsd)}</span>;
}
