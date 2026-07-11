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
import { formatMoney, formatTzs, usdToTzsCash } from "@/lib/utils";

export type DisplayCurrency = "USD" | "TZS";

const STORAGE_KEY = "sokasafari_travel_display_currency";

type CurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDisplayCurrencyState(readStored());
    setHydrated(true);
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
        return formatTzs(usdToTzsCash(usdAmount));
      }
      return formatMoney(usdAmount, "USD");
    },
    [displayCurrency],
  );

  const value = useMemo(
    () => ({
      displayCurrency: hydrated ? displayCurrency : "USD",
      setDisplayCurrency,
      formatAmount,
    }),
    [displayCurrency, formatAmount, hydrated, setDisplayCurrency],
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
