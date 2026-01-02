// lib/useBillingSSE.ts (client)
"use client";

import { useEffect } from "react";

type BillDTO = {
  id: number; orderId: number;
  subtotal: number; tax: number; serviceFee: number; totalAmount: number;
  status: string;
};

type Handlers = {
  onConnected?: () => void;
  onCreated?: (bill: BillDTO) => void;
  onUpdated?: (bill: BillDTO) => void;
};

export function useBillingSSE(token: string | null, handlers: Handlers) {
  useEffect(() => {
    if (!token) return;

    const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
    const url = `${base}/sse/billing/stream?jwt=${encodeURIComponent(token)}`;
    const es = new EventSource(url, { withCredentials: false });

    const parse = <T,>(ev: MessageEvent): T => JSON.parse(ev.data);

    const onConnected = (e: MessageEvent) => handlers.onConnected?.();
    const onCreated = (e: MessageEvent) => handlers.onCreated?.(parse<BillDTO>(e));
    const onUpdated = (e: MessageEvent) => handlers.onUpdated?.(parse<BillDTO>(e));

    es.addEventListener("connected", onConnected);
    es.addEventListener("BILL_CREATED", onCreated);
    es.addEventListener("BILL_UPDATED", onUpdated);

    es.onerror = () => {
      // browser will auto-reconnect; you can show a badge if you want
    };

    return () => es.close();
  }, [token, handlers]);
}
