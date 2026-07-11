import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a minor-unit-free amount as a localized currency string. */
export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** USD → TZS rate (fallback when live FX unavailable). */
export function usdToTzsRate(): number {
  const raw =
    process.env.NEXT_PUBLIC_USD_TO_TZS_RATE ??
    process.env.USD_TO_TZS_RATE ??
    "2500";
  const rate = Number(raw);
  return Number.isFinite(rate) && rate > 0 ? rate : 2500;
}

/** Round TZS to nearest 50 (circulating cash notes). */
export function usdToTzsCash(usd: number, rate: number = usdToTzsRate()): number {
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : usdToTzsRate();
  const tzs = Math.round(usd * safeRate);
  return Math.round(tzs / 50) * 50;
}

export function formatTzs(amount: number): string {
  return `TZS ${new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(amount)}`;
}

/** Show both USD and TZS for traveller-facing fares. */
export function formatMoneyDual(usdAmount: number, rate?: number): string {
  const usd = formatMoney(usdAmount, "USD");
  const tzs = formatTzs(usdToTzsCash(usdAmount, rate));
  return `${usd} · ${tzs}`;
}

/** Duration in minutes -> "7h 20m" / "45m". */
export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Difference between two ISO timestamps in whole minutes. */
export function diffMinutes(startIso: string, endIso: string) {
  return Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000,
  );
}

export function generatePnr() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
