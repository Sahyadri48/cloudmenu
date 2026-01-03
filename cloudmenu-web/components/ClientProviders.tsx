"use client";
import { CurrencyProvider } from "@/lib/currency";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
