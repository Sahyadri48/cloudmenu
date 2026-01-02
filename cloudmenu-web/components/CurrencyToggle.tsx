"use client";

import { useEffect, useState } from "react";

export type Currency = "USD" | "INR";

type Props = {
  value?: Currency;
  onChange?: (c: Currency) => void;
  className?: string;
};

export default function CurrencyToggle({ value = "USD", onChange, className = "" }: Props) {
  const [curr, setCurr] = useState<Currency>(value);

  useEffect(() => {
    // restore last choice
    const saved = typeof window !== "undefined" ? (localStorage.getItem("currency") as Currency) : null;
    if (saved === "USD" || saved === "INR") {
      setCurr(saved);
      onChange?.(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (c: Currency) => {
    setCurr(c);
    onChange?.(c);
    if (typeof window !== "undefined") localStorage.setItem("currency", c);
  };

  const isUSD = curr === "USD";

  return (
    <div
      className={`relative inline-flex items-center rounded-full bg-gradient-to-r from-gray-700 to-gray-500 p-1 shadow-md ${className}`}
      role="tablist"
      aria-label="Currency"
    >
      {/* sliding thumb */}
      <span
        className={`absolute left-1 top-1 h-9 w-32 rounded-full bg-white shadow transition-transform duration-300 ease-out ${
          isUSD ? "translate-x-0" : "translate-x-[8.5rem]"
        }`}
      />
      <button
        role="tab"
        aria-selected={isUSD}
        onClick={() => select("USD")}
        className={`relative z-10 w-32 h-9 rounded-full text-sm font-semibold tracking-wide transition-colors ${
          isUSD ? "text-gray-900" : "text-white/80 hover:text-white"
        }`}
      >
        <span className="mr-1">$</span> USD
      </button>
      <button
        role="tab"
        aria-selected={!isUSD}
        onClick={() => select("INR")}
        className={`relative z-10 w-32 h-9 rounded-full text-sm font-semibold tracking-wide transition-colors ${
          !isUSD ? "text-gray-900" : "text-white/80 hover:text-white"
        }`}
      >
        <span className="mr-1">₹</span> INR
      </button>
      {/* outline ring */}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-black/70" />
    </div>
  );
}
