"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ============ Types (best-guess from your DTOs) ============ */
type Restaurant = { id: number; name: string };
type OrderDTO = {
  id: number;
  code?: string;
  customerName?: string;
  items?: Array<{ id: number }>;
  totalAmount?: number;
  status?: "NEW" | "PREPARING" | "READY" | "COMPLETED" | string;
  createdAt?: string;
};
type MenuItemDTO = {
  id: number;
  name: string;
  category?: string;
  price?: number;
  rating?: number | null;
  active?: boolean;
  monthlyOrders?: number | null;
  imageUrl?: string | null;
};

/* ============ UI helpers ============ */
const currency = (n: number) =>
  `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const statusBadge = (s?: string) => {
  switch (s) {
    case "PREPARING":
      return "bg-amber-100 text-amber-700";
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    case "NEW":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
    default:
      return "bg-gray-100 text-gray-600";
  }
};
const MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shortDowUTC(dateStr: string) {
  const d = new Date(dateStr);
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[d.getUTCDay()]; // use UTC to avoid timezone rollovers
}

/* ============ Topbar (username + logout) ============ */
function Topbar({ name }: { name?: string }) {
  const router = useRouter();
  const initials = (name || "U").trim().charAt(0).toUpperCase();

  const onLogout = async () => {
    try {
      // Your backend doesn't require this, but it's safe if you add one later:
      await api.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-gray-50/70 backdrop-blur border-b">
      <div className="h-14 flex items-center justify-between px-6">
        <div className="text-xl font-semibold">CloudMenu</div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex text-sm text-gray-600">{name}</div>
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white grid place-items-center text-sm font-medium">
            {initials}
          </div>
          <button
            onClick={onLogout}
            className="text-sm px-3 py-1.5 rounded-lg border hover:bg-white"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Tiny bar chart (no extra libs) ============ */
function BarChart({ data }: { data: { day: string; amount: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-4 h-48 px-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center gap-2">
          <div
            className="w-8 rounded-t bg-teal-500"
            style={{ height: `${(d.amount / max) * 160}px` }}
            title={`$${d.amount.toFixed(0)}`}
          />
          <div className="text-xs text-gray-500">{d.day}</div>
        </div>
      ))}
    </div>
  );
}

/* ============ KPI Card ============ */
function KPI({
  title,
  value,
  action,
  href,
}: {
  title: string;
  value: string | number;
  action: string;
  href: string;
}) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-5">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-gray-500 text-sm mt-1">{title}</div>
      <a
        href={href}
        className="mt-4 inline-block bg-teal-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-teal-700"
      >
        {action}
      </a>
    </div>
  );
}

/* ============ PAGE ============ */
export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [menu, setMenu] = useState<MenuItemDTO[]>([]);
  const [error, setError] = useState("");

  // 1) bootstrap
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const { data: r } = await api.get<Restaurant>("/api/auth/restaurant");
        setRestaurant(r);
        if (r?.id) localStorage.setItem("restaurantId", String(r.id));

        // Fetch everything we need using your existing controllers
        const [ordersRes, menuRes] = await Promise.all([
          api.get<OrderDTO[]>("/api/orders"), // we'll compute stats client-side
          api.get<MenuItemDTO[]>(`/api/menu/items?restaurantId=${r.id}`),
        ]);
        setOrders(ordersRes.data ?? []);
        setMenu(menuRes.data ?? []);
      } catch (e: any) {
        console.error(e);
        setError("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => (window.location.href = "/login"), 1000);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 2) derive KPIs + weekly sales from orders & menu */
  const preparingOrders = useMemo(
    () => orders.filter((o) => o.status === "PREPARING").length,
    [orders]
  );

  const activeDishes = useMemo(
    () => menu.filter((m) => m.active).length,
    [menu]
  );

const weeklySales = useMemo(() => {
  // Totals by weekday name for orders completed in the last 7 calendar days
  const totals = new Map<string, number>();

  const now = new Date();
  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 6
  ));

  for (const o of orders) {
    if (o.status !== "COMPLETED" || !o.createdAt) continue;

    const t = new Date(o.createdAt);
    if (t < start) continue;

    const name = shortDowUTC(o.createdAt); // "Sun".."Sat"
    totals.set(name, (totals.get(name) ?? 0) + (o.totalAmount ?? 0));
  }

  // Emit strictly in Mon..Sun order, fill missing with 0
  return MON_FIRST.map((name) => ({
    day: name,
    amount: totals.get(name) ?? 0,
  }));
}, [orders]);


  const revenueWeek = weeklySales.reduce((a, b) => a + b.amount, 0);

  // "Total users" – since you don’t have a users controller here, we’ll approximate:
  // count unique customerNames across all orders (change if you have a users endpoint).
  const totalUsers = useMemo(() => {
    const set = new Set(
      orders
        .map((o) => (o.customerName || "").trim())
        .filter((n) => n.length > 0)
    );
    return set.size;
  }, [orders]);

  // Recent orders = newest 5
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 5);
  }, [orders]);

  // Enable/Disable: PUT /api/menu/items/{id} with flipped "active"
 async function toggleMenuActive(mi: MenuItemDTO) {
  // optimistic UI
  setMenu(prev =>
    prev.map(x => (x.id === mi.id ? { ...x, active: !mi.active } : x))
  );

  try {
    // call your existing endpoint; we don't depend on response shape
    await api.put(`/api/menu/items/${mi.id}`, { ...mi, active: !mi.active });
  } catch (e) {
    // rollback if server fails
    setMenu(prev =>
      prev.map(x => (x.id === mi.id ? { ...x, active: mi.active } : x))
    );
    console.error("Failed to toggle item:", e);
    alert("Failed to update item. Check server logs.");
  }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 w-full min-h-screen bg-gray-50">
        <Topbar name={restaurant?.name} />

        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold mb-2">Overview</h1>
          <p className="text-gray-600 mb-6">
            Welcome{restaurant?.name ? `, ${restaurant.name}` : ""} 👋
          </p>

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPI
              title="Orders being prepared"
              value={preparingOrders}
              action="Manage Orders"
              href="/dashboard/orders"
            />
            <KPI
              title="Active dishes available"
              value={activeDishes}
              action="Edit Menu"
              href="/dashboard/menu"
            />
            <KPI
              title="Revenue from 7 days"
              value={currency(revenueWeek)}
              action="View Details"
              href="/dashboard/billing"
            />
            <KPI
              title="Total registered users"
              value={totalUsers}
              action="View All"
              href="/dashboard/profile"
            />
          </div>

          {/* Two columns: Recent orders + Weekly sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <section className="bg-white border rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Recent Orders</h2>
                <a href="/dashboard/orders" className="text-sm text-teal-700 hover:underline">
                  View All Orders
                </a>
              </div>
              <div className="divide-y">
                {recentOrders.length === 0 && (
                  <div className="px-5 py-12 text-center text-gray-400">No recent orders.</div>
                )}
                {recentOrders.map((o) => (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        #{o.code ?? String(o.id).padStart(3, "0")}
                        <span
                          className={`ml-2 text-[11px] px-2 py-0.5 rounded-full align-middle ${statusBadge(
                            o.status
                          )}`}
                        >
                          {o.status ?? "—"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.customerName ?? "—"} • {(o.items?.length ?? 0)} items •{" "}
                        {o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold">${(o.totalAmount ?? 0).toFixed(2)}</div>
                      <a
                        href={`/dashboard/orders/${o.id}`}
                        className="text-sm text-teal-700 hover:underline"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly Sales */}
            <section className="bg-white border rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Weekly Sales</h2>
                  <div className="text-xs text-gray-500">
                    Total: {currency(weeklySales.reduce((a, b) => a + (b.amount || 0), 0))}
                  </div>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  +12.5% Growth
                </span>
              </div>
              <div className="px-5 py-4">
                <BarChart data={weeklySales} />
              </div>
            </section>
          </div>

          {/* Menu Items */}
          <section className="bg-white border rounded-2xl shadow-sm mt-6">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Menu Items</h2>
              <a
                href="/dashboard/menu"
                className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"
              >
                Add New Item
              </a>
            </div>
            <div className="divide-y">
              {menu.length === 0 && (
                <div className="px-5 py-12 text-center text-gray-400">No menu items yet.</div>
              )}
              {menu.slice(0, 4).map((m) => (
                <div key={m.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {m.name}
                      <span
                        className={`ml-2 text-[11px] px-2 py-0.5 rounded-full ${
                          m.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.active ? "active" : "inactive"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {m.category ?? "—"}
                      {m.rating ? ` • Rating: ${m.rating}` : ""}
                      {m.monthlyOrders ? ` • ${m.monthlyOrders} orders this month` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMenuActive(m)}
                      className={`text-sm px-3 py-1.5 rounded-lg border ${
                        m.active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {m.active ? "Disable" : "Enable"}
                    </button>
<Link
  href={`/dashboard/menu?edit=${m.id}`}
  className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
>
  Edit
</Link>


                      
                    
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

