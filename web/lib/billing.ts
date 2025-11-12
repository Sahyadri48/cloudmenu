// lib/billing.ts
import { api } from "@/lib/api";

export type Bill = {
  id: number;
  orderId: number;
  tableCode?: string | null;
  customerName?: string | null;
  items?: { name: string; qty: number; unitPrice: number; tag?: string }[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  totalAmount: number;
  status: "ACTIVE" | "PAID" | "INACTIVE" | "COMPLETED";
  createdAt: string;
  printedAt?: string | null;
};

export async function fetchActive() {
  const { data } = await api.get<{ content: Bill[] }>("/api/bills/active?page=0&size=50");
  return data.content;
}
export async function fetchHistory(fromISO: string, toISO: string) {
  const { data } = await api.get<{ content: Bill[] }>(`/api/bills/history?from=${fromISO}&to=${toISO}&page=0&size=50`);
  return data.content;
}
export async function fetchSummaryToday() {
  const { data } = await api.get<{ activeTables: number; todayRevenue: number; avgBill: number }>("/api/bills/summary/today");
  return data;
}
export async function markPrinted(id: number) {
  await api.patch(`/api/bills/${id}/status?status=PAID`);
}
