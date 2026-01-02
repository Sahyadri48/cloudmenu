// lib/analytics.ts
import { api } from "./api";

/* ---------------- Customers (existing) ---------------- */

export type CustomerSummary = {
  customerId: number;
  fullName: string;
  email: string;
  ordersCount: number;
  totalBilled: number;
};

export async function fetchCustomerSummaries(): Promise<CustomerSummary[]> {
  const res = await api.get<CustomerSummary[]>("/api/analytics/customers/summary");
  return res.data;
}

/* ---------------- Analytics (new) ---------------- */

export type DailyPoint = {
  day: string;        // ISO YYYY-MM-DD (from backend)
  amount: number;     // revenue for that day
};

export type TopItem = {
  name: string;
  qty: number;
};

export type AnalyticsMetrics = {
  revenue: number;         // total revenue in range
  orders: number;          // total orders in range
  avgOrder: number;        // revenue / orders
  rating: number;          // placeholder (e.g., 4.8)
  daily: DailyPoint[];     // series for chart
  topItems: TopItem[];     // best-selling items
};

/**
 * Fetch analytics metrics for the given date range (inclusive).
 * Dates must be "YYYY-MM-DD".
 *
 * Example:
 *   const m = await fetchAnalyticsMetrics("2025-11-04", "2025-11-10");
 */
export async function fetchAnalyticsMetrics(from: string, to: string): Promise<AnalyticsMetrics> {
  const res = await api.get<AnalyticsMetrics>("/api/analytics/metrics", {
    params: { from, to },
  });
  return res.data;
}

/**
 * Helper: get ISO date strings for a rolling window ending today.
 * rangeDays=7 | 30 | 90 typically.
 */
export function getRange(rangeDays: number): { from: string; to: string } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (rangeDays - 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(start), to: fmt(today) };
}
