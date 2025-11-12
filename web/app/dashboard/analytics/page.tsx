"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SimpleBar from "@/components/SimpleBar";
import { fetchAnalyticsMetrics, AnalyticsMetrics } from "@/lib/analytics";

type Range = "7" | "30" | "90";

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsMetrics | null>(null);

  const { from, to } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (parseInt(range) - 1));
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { from: fmt(start), to: fmt(end) };
  }, [range]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchAnalyticsMetrics(from, to);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  const bars = useMemo(() => {
    if (!data) return [];
    return data.daily.map(d => ({
      label: new Date(d.day).toLocaleDateString(undefined, { weekday: "short" }),
      value: d.amount ?? 0,
    }));
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <select
            className="rounded-lg border px-3 py-2"
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {loading || !data ? (
          <div className="text-gray-500">Loading analytics…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Kpi title="Revenue" value={formatCurrency(data.revenue)} trend="+12.5%" />
              <Kpi title="Orders" value={data.orders.toString()} trend="+8.2%" />
              <Kpi title="Avg Order" value={formatCurrency(data.avgOrder)} trend="-2.1%" down />
              <Kpi title="Rating" value={`${data.rating.toFixed(1)}/5`} trend="+0.3" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly revenue chart */}
              <div className="lg:col-span-2 rounded-2xl border bg-white">
                <div className="p-5 border-b">
                  <div className="font-medium">Weekly Revenue</div>
                </div>
                <div className="p-2">
                  <SimpleBar data={bars} />
                </div>
              </div>

              {/* Top items */}
              <div className="rounded-2xl border bg-white">
                <div className="p-5 border-b">
                  <div className="font-medium">Top Items</div>
                </div>
                <ul>
                  {data.topItems.length === 0 ? (
                    <li className="p-5 text-gray-500">No items in range.</li>
                  ) : (
                    data.topItems.map((t, i) => (
                      <li key={i} className="flex items-center justify-between px-5 py-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🍽️</span>
                          <span>{t.name}</span>
                        </div>
                        <span className="text-gray-600">{t.qty}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Kpi({ title, value, trend, down }: { title: string; value: string; trend?: string; down?: boolean }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      {trend && (
        <div className={`text-sm mt-1 ${down ? "text-red-600" : "text-emerald-700"}`}>{trend}</div>
      )}
    </div>
  );
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);
  } catch {
    return `₹${(n || 0).toFixed(2)}`;
  }
}
