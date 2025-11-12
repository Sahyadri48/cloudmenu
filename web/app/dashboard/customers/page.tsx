"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCustomerSummaries, CustomerSummary } from "@/lib/analytics";
import Sidebar from "@/components/Sidebar";

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CustomerSummary[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCustomerSummaries();
        setRows(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(needle) ||
        r.email?.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar rendered inside this page */}
      <Sidebar />

      {/* Page content shifted to the right of the fixed sidebar */}
      <main className="ml-60 p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold">Customers</h1>

          <div className="relative">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customers..."
              className="w-64 rounded-xl border px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white border">
          {loading ? (
            <div className="p-8 text-gray-500">Loading customers…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-gray-500">No customers found.</div>
          ) : (
            <ul>
              {filtered.map((c, i) => (
                <li
                  key={c.customerId}
                  className={`flex items-center justify-between px-6 py-4 ${
                    i !== filtered.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <AvatarCircle name={c.fullName} />
                    <div>
                      <div className="font-medium">{c.fullName}</div>
                      <div className="text-gray-500 text-sm">{c.email}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-emerald-700 font-medium">
                      {c.ordersCount} {c.ordersCount === 1 ? "order" : "orders"}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatCurrency(c.totalBilled)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function AvatarCircle({ name }: { name?: string }) {
  const initials = useMemo(() => {
    if (!name) return "C";
    const parts = name.trim().split(/\s+/);
    const one = parts[0]?.[0] ?? "";
    const two = parts[1]?.[0] ?? "";
    return (one + two).toUpperCase() || "C";
  }, [name]);

  return (
    <div className="w-10 h-10 rounded-full bg-emerald-600/90 text-white grid place-items-center font-semibold">
      {initials}
    </div>
  );
}

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `₹${(amount || 0).toFixed(2)}`;
  }
}

