"use client";

import { CurrencySwitcher } from "@/components/CurrencySwitcher";

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-title">{title}</h1>
        {subtitle && <p className="text-sm text-subtitle">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <CurrencySwitcher compact />
        {action}
      </div>
    </header>
  );
}
