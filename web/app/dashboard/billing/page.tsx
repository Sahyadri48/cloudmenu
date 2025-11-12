 "use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Bill,
  fetchActive,
  fetchHistory,
  fetchSummaryToday,
  markPrinted,
} from "@/lib/billing";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

type Tab = "ACTIVE" | "PAST";

export default function BillingPage() {
  const [tab, setTab] = useState<Tab>("ACTIVE");
  const [q, setQ] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<{
    activeTables: number;
    todayRevenue: number;
    avgBill: number;
  } | null>(null);

  const fromISO = useMemo(
    () => new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10),
    []
  );
  const toISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Load initial
  async function load() {
    const [active, s] = await Promise.all([fetchActive(), fetchSummaryToday()]);
    setBills(active);
    setSummary(s);
  }
  useEffect(() => {
    // keep the effect sync; ignore the returned promise
    void load();
  }, []);

  // Tab switch loads (keep effect sync; use async IIFE inside)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data =
        tab === "ACTIVE"
          ? await fetchActive()
          : await fetchHistory(fromISO, toISO);
      if (!cancelled) setBills(data);
    })().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [tab, fromISO, toISO]);

  // STOMP client for live events (only on ACTIVE tab)
  const stomp = useRef<Client | null>(null);
  useEffect(() => {
    if (tab !== "ACTIVE") return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => {},
      onConnect: () => {
        // if you placed restaurantId in token claims and return it to FE, you can
        // also read it from a /whoami endpoint; here we use a static "0"
        client.subscribe("/topic/bills/0", (frame) => {
          const { type, bill } = JSON.parse(frame.body);
          setBills((prev) => {
            const m = new Map(prev.map((b) => [b.id, b]));
            m.set(bill.id, bill);
            return Array.from(m.values()).sort((a, b) => b.id - a.id);
          });
          // refresh summary too
          fetchSummaryToday().then(setSummary).catch(console.error);
        });
      },
    });

    client.activate();
    stomp.current = client;

    return () => {
      client.deactivate();
      stomp.current = null;
    };
  }, [tab]);

  // filtering (q by tableCode, customerName, orderId, item names)
  const filtered = bills.filter((b) => {
    if (!q.trim()) return true;
    const hay = [
      b.orderId,
      b.tableCode ?? "",
      b.customerName ?? "",
      ...(b.items?.map((i) => i.name) ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const currency = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 w-full p-8 bg-gray-50 min-h-screen">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Live Bill Management</h1>
          <p className="text-gray-500">Real-time restaurant billing system</p>
        </header>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="bg-white border rounded-xl p-1 flex">
            <button
              onClick={() => setTab("ACTIVE")}
              className={`px-4 py-2 rounded-lg ${
                tab === "ACTIVE"
                  ? "bg-teal-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Active Bills
            </button>
            <button
              onClick={() => setTab("PAST")}
              className={`px-4 py-2 rounded-lg ${
                tab === "PAST"
                  ? "bg-teal-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Past Bills
            </button>
          </div>
          <div className="flex-1" />
          <div className="bg-white border rounded-xl px-3 py-2 flex items-center gap-2 w-[420px] max-w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by table, customer, menu items…"
              className="flex-1 outline-none"
            />
            {q && (
              <button
                className="text-sm text-gray-500"
                onClick={() => setQ("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* KPIs */}
        {summary && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPI label="Active Tables" value={summary.activeTables} />
            <KPI label="Today's Revenue" value={currency(summary.todayRevenue)} />
            <KPI label="Average Bill" value={currency(summary.avgBill)} />
          </section>
        )}

        {/* Bill cards */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtered.map((b) => (
            <BillCard
              key={b.id}
              bill={b}
              onPrint={async (id) => {
                await markPrinted(id);
                if (tab === "ACTIVE") {
                  const fresh = await fetchActive();
                  setBills(fresh);
                }
              }}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function BillCard({
  bill,
  onPrint,
}: {
  bill: any;
  onPrint: (id: number) => void | Promise<void>; // allow async handler
}) {
  const currency = (n: number) => `$${n.toFixed(2)}`;
  return (
    <div className="bg-white border rounded-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <div className="font-semibold">
            {bill.tableCode ?? `T-${String(bill.orderId).padStart(2, "0")}`}
          </div>
          <div className="text-xs text-gray-500">
            {bill.customerName ?? "—"} •{" "}
            {new Date(bill.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            bill.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {bill.status}
        </span>
      </div>

      <div className="px-6 py-4 space-y-2">
        {(bill.items ?? []).map((it: any, idx: number) => (
          <div key={idx} className="flex justify-between text-sm">
            <div className="text-gray-700">
              {it.qty}x {it.name}
            </div>
            <div className="font-medium">
              {currency((it.qty ?? 0) * (it.unitPrice ?? 0))}
            </div>
          </div>
        ))}

        <div className="border-t my-2" />
        <Row label="Subtotal" value={currency(bill.subtotal ?? 0)} />
        <Row label="Tax" value={currency(bill.tax ?? 0)} />
        <Row label="Service" value={currency(bill.serviceFee ?? 0)} />
        <Row bold label="Total" value={currency(bill.totalAmount ?? 0)} />
      </div>

      <div className="px-6 pb-5">
        <button
          onClick={() => onPrint(bill.id)}
          className="w-full bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700"
        >
          {bill.status === "ACTIVE" ? "Print Bill" : "Reprint"}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <div className="text-gray-600">{label}</div>
      <div className={bold ? "font-semibold" : "text-gray-800"}>{value}</div>
    </div>
  );
}
