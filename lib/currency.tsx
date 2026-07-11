"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { formatMoney, formatTzs, usdToTzsCash, usdToTzsRate } from "@/lib/utils";

export type DisplayCurrency = "USD" | "TZS";

const STORAGE_KEY = "sokasafari_travel_display_currency";

/** Same FX endpoint the mobile app uses — keeps TZS labels identical. */
function fxUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_SOKASAFARI_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://sokasafari-cab6a0e8291c.herokuapp.com/api"
  ).replace(/\/+$/, "");
  return `${base}/fx/usd-tzs`;
}

type CurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  /** Live USD→TZS rate (same source as the SokaSafari app). */
  usdToTzs: number;
  /** Format a USD whole-dollar amount in the user's preferred currency. */
  formatAmount: (usdAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStored(): DisplayCurrency {
  if (typeof window === "undefined") return "USD";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "TZS" || raw === "USD") return raw;
  } catch {
    /* ignore */
  }
  return "USD";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("USD");
  const [usdToTzs, setUsdToTzs] = useState(usdToTzsRate());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDisplayCurrencyState(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(fxUrl(), { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const data = (await res.json()) as { usd_to_tzs_rate?: number };
        const rate = Number(data.usd_to_tzs_rate);
        if (!cancelled && Number.isFinite(rate) && rate > 0) {
          setUsdToTzs(rate);
        }
      } catch {
        /* keep env/default rate */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const formatAmount = useCallback(
    (usdAmount: number) => {
      if (displayCurrency === "TZS") {
        return formatTzs(usdToTzsCash(usdAmount, usdToTzs));
      }
      return formatMoney(usdAmount, "USD");
    },
    [displayCurrency, usdToTzs],
  );

  const value = useMemo(
    () => ({
      displayCurrency: hydrated ? displayCurrency : "USD",
      setDisplayCurrency,
      usdToTzs,
      formatAmount,
    }),
    [displayCurrency, formatAmount, hydrated, setDisplayCurrency, usdToTzs],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
