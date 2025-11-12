"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Currency = "USD" | "INR";

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  inrPerUsd: number;
  money: (n: number) => string;
  convertFromUSD: (usd: number) => number;
};

const CurrencyCtx = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // default from localStorage or USD
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("cm_currency")) as Currency | null;
    if (saved === "USD" || saved === "INR") setCurrency(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cm_currency", currency);
    }
  }, [currency]);

  const inrPerUsd = Number(process.env.NEXT_PUBLIC_INR_PER_USD || "83") || 83;

  const value = useMemo<Ctx>(() => {
    const convertFromUSD = (usd: number) =>
      currency === "USD" ? Math.round(usd) : Math.round(usd * inrPerUsd);
    const money = (n: number) => (currency === "USD" ? `$${n}` : `₹${n}`);
    return { currency, setCurrency, inrPerUsd, convertFromUSD, money };
  }, [currency, inrPerUsd]);

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
