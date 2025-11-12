"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { api } from "@/lib/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/* ======================= Types ======================= */
type OrderAddonDTO = { id: number; name: string; price: number };
type OrderItemDTO = {
  id: number;
  menuItemId: number;
  name?: string;
  quantity: number;
  basePrice: number;
  specialInstructions?: string;
  status: string;
  addons?: OrderAddonDTO[];
};
type OrderDTO = {
  id: number;
  restaurantId: number;
  customerId: number;
  orderNumber: string;
  tableNumber: number;
  status: "NEW" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "COMPLETED" | string;
  totalAmount: number;
  items: OrderItemDTO[];
};

type BillLine = { name: string; qty: number; unitPrice: number; tag?: string };
type BillDTO = {
  id: number;
  orderId: number;
  tableCode?: string | null;
  customerName?: string | null;
  items?: BillLine[] | null;
  subtotal: number;
  tax: number;
  serviceFee: number;
  totalAmount: number;
  status: "ACTIVE" | "PAID" | "INACTIVE" | "COMPLETED" | string;
  createdAt?: string | null;
  printedAt?: string | null;
};

type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/* ======================= Utils ======================= */
const currency = (n: number, c = "INR") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n ?? 0);

const orderBadge = (s?: string) => {
  switch (s) {
    case "NEW": return "bg-blue-100 text-blue-700";
    case "PREPARING": return "bg-amber-100 text-amber-700";
    case "READY": return "bg-emerald-100 text-emerald-700";
    case "SERVED": return "bg-violet-100 text-violet-700";
    case "COMPLETED": return "bg-gray-100 text-gray-600";
    case "CANCELLED": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
};
const billBadge = (s?: string) => {
  switch (s) {
    case "ACTIVE": return "bg-indigo-100 text-indigo-700";
    case "PAID": return "bg-emerald-100 text-emerald-700";
    case "COMPLETED": return "bg-teal-100 text-teal-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

function isoDate(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

/* ======================= Poll hook ======================= */
function usePoll<T>(fn: () => Promise<T>, deps: any[], ms = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState("");

  useEffect(() => {
    let stop = false;
    const run = async () => {
      try {
        setErr("");
        const val = await fn();
        if (!stop) setData(val);
      } catch (e: any) {
        if (!stop) setErr(e?.response?.data?.error || "Failed to load");
      } finally {
        if (!stop) setLoading(false);
      }
    };
    run();
    const id = setInterval(run, ms);
    return () => {
      stop = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}

/* ======================= Small UI bits ======================= */
function TopTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border overflow-hidden">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 text-sm border-r last:border-r-0 ${
            active === t ? "bg-teal-600 text-white" : "bg-white hover:bg-gray-50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border rounded-2xl shadow-sm">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="text-sm text-teal-700 hover:underline">
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ======================= Tables ======================= */
function OrdersTable({ rows }: { rows: OrderDTO[] }) {
  if (!rows.length) return <div className="py-10 text-center text-gray-400">No live orders.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="py-2 pr-4">Order</th>
            <th className="py-2 pr-4">Table</th>
            <th className="py-2 pr-4">Items</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="py-3 pr-4 font-medium">#{o.orderNumber ?? String(o.id).padStart(3, "0")}</td>
              <td className="py-3 pr-4">T-{o.tableNumber}</td>
              <td className="py-3 pr-4">{o.items?.length ?? 0}</td>
              <td className="py-3 pr-4">{currency(o.totalAmount ?? 0)}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full ${orderBadge(o.status)}`}>{o.status}</span>
              </td>
              <td className="py-3 pr-4">
                <Link href="/dashboard/orders" className="text-teal-700 hover:underline">
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BillsTable({ rows, emptyText }: { rows: BillDTO[]; emptyText: string }) {
  if (!rows.length) return <div className="py-10 text-center text-gray-400">{emptyText}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="py-2 pr-4">Bill</th>
            <th className="py-2 pr-4">Order</th>
            <th className="py-2 pr-4">Subtotal</th>
            <th className="py-2 pr-4">Tax</th>
            <th className="py-2 pr-4">Service</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="py-3 pr-4 font-medium">B{String(b.id).padStart(3, "0")}</td>
              <td className="py-3 pr-4">#{String(b.orderId).padStart(3, "0")}</td>
              <td className="py-3 pr-4">{currency(b.subtotal)}</td>
              <td className="py-3 pr-4">{currency(b.tax)}</td>
              <td className="py-3 pr-4">{currency(b.serviceFee)}</td>
              <td className="py-3 pr-4 font-semibold">{currency(b.totalAmount)}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full ${billBadge(b.status)}`}>{b.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ======================= Page ======================= */
export default function LivePage() {
  // ---------- top-level tab: Orders vs Billing ----------
  const [tab, setTab] = useState<"Live Orders" | "Live Billing">("Live Orders");
  // billing sub-tab
  const [billTab, setBillTab] = useState<"Active" | "Past (7 days)">("Active");

  // ---------- Polling (seed data) ----------
  const { data: ordersData, loading: ordersLoading, error: ordersErr } = usePoll<OrderDTO[]>(
    async () => (await api.get<OrderDTO[]>("/api/orders")).data ?? [],
    [],
    5000
  );

  const { data: activeBillsPage, loading: activeBillsLoading, error: activeBillsErr } = usePoll<SpringPage<BillDTO>>(
    async () => (await api.get<SpringPage<BillDTO>>("/api/bills/active", { params: { page: 0, size: 50 } })).data,
    [],
    5000
  );

  // Past (7 days)
  const [pastBills, setPastBills] = useState<BillDTO[]>([]);
  const [pastLoading, setPastLoading] = useState(false);
  const [pastErr, setPastErr] = useState("");

  const loadPast = async () => {
    try {
      setPastErr("");
      setPastLoading(true);
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 7);
      const res = await api.get<SpringPage<BillDTO>>("/api/bills/history", {
        params: { from: isoDate(from), to: isoDate(to), page: 0, size: 50 },
      });
      setPastBills(res.data.content ?? []);
    } catch (e: any) {
      setPastErr(e?.response?.data?.error || "Failed to load past bills");
    } finally {
      setPastLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "Live Billing" && billTab === "Past (7 days)") {
      loadPast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, billTab]);

  // ---------- State ----------
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [activeBills, setActiveBills] = useState<BillDTO[]>([]);

  useEffect(() => {
    if (ordersData) setOrders(ordersData);
  }, [ordersData]);

  useEffect(() => {
    if (activeBillsPage?.content) setActiveBills(activeBillsPage.content);
  }, [activeBillsPage]);

  // ---------- WebSocket (orders + bills) ----------
  const rid = typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;

  useEffect(() => {
    if (!rid) return;
    const sock = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => sock as any,
      reconnectDelay: 2000,
      debug: () => {},
      onConnect: () => {
        client.subscribe(`/topic/orders/${rid}`, (msg) => {
          try {
            const order: OrderDTO = JSON.parse(msg.body);
            setOrders((prev) => {
              const i = prev.findIndex((x) => x.id === order.id);
              if (i >= 0) {
                const copy = prev.slice();
                copy[i] = order;
                return copy;
              }
              return [order, ...prev].slice(0, 200);
            });
          } catch {}
        });

        client.subscribe(`/topic/bills/${rid}`, (msg) => {
          try {
            const bill: BillDTO = JSON.parse(msg.body);
            setActiveBills((prev) => {
              // if bill moved out of ACTIVE, keep list consistent
              const stillActive = bill.status === "ACTIVE";
              const i = prev.findIndex((x) => x.id === bill.id);
              if (i >= 0) {
                const copy = prev.slice();
                if (stillActive) {
                  copy[i] = bill;
                  return copy;
                } else {
                  copy.splice(i, 1);
                  return copy;
                }
              }
              return stillActive ? [bill, ...prev].slice(0, 200) : prev;
            });
            // if we’re on Past tab, refresh it when a bill finishes
            if (tab === "Live Billing" && billTab === "Past (7 days)" && bill.status !== "ACTIVE") {
              loadPast();
            }
          } catch {}
        });
      },
    });

    client.activate();
    return () => {
      try {
        client.deactivate();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rid]);

  const ordersMemo = useMemo(() => orders ?? [], [orders]);
  const activeBillsMemo = useMemo(() => activeBills ?? [], [activeBills]);
  const pastBillsMemo = useMemo(() => pastBills ?? [], [pastBills]);

  /* ======================= Render ======================= */
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 w-full min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50/70 backdrop-blur border-b">
          <div className="h-14 flex items-center justify-between px-6">
            <div className="text-xl font-semibold">Live Desk</div>
            <div className="flex items-center gap-4">
              <TopTabs
                tabs={["Live Orders", "Live Billing"]}
                active={tab}
                onChange={(t) => setTab(t as any)}
              />
              <span className="text-xs text-gray-500">Real-time + 5s fallback</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* Orders view */}
          {tab === "Live Orders" && (
            <SectionCard title="Live Orders" actionHref="/dashboard/orders" actionLabel="Open Live Desk">
              {ordersLoading && ordersMemo.length === 0 ? (
                <div className="py-10 text-center text-gray-500">Loading…</div>
              ) : ordersErr ? (
                <div className="py-10 text-center text-red-600">{ordersErr}</div>
              ) : (
                <OrdersTable rows={ordersMemo} />
              )}
            </SectionCard>
          )}

          {/* Billing view */}
          {tab === "Live Billing" && (
            <SectionCard title="Live Billing" actionHref="/dashboard/billing" actionLabel="Open Live Desk">
              {/* Sub-tabs */}
              <div className="mb-4">
                <TopTabs
                  tabs={["Active", "Past (7 days)"]}
                  active={billTab}
                  onChange={(t) => setBillTab(t as any)}
                />
              </div>

              {billTab === "Active" ? (
                activeBillsLoading && activeBillsMemo.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">Loading…</div>
                ) : activeBillsErr ? (
                  <div className="py-10 text-center text-red-600">{activeBillsErr}</div>
                ) : (
                  <BillsTable rows={activeBillsMemo} emptyText="No live bills." />
                )
              ) : pastLoading ? (
                <div className="py-10 text-center text-gray-500">Loading…</div>
              ) : pastErr ? (
                <div className="py-10 text-center text-red-600">{pastErr}</div>
              ) : (
                <BillsTable rows={pastBillsMemo} emptyText="No bills in the past 7 days." />
              )}
            </SectionCard>
          )}
        </div>
      </main>
    </div>
  );
}
