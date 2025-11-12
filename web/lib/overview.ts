// lib/overview.ts
import { api } from "@/lib/api";

/* ---------- Types used by the Overview UI ---------- */
export type RecentOrder = {
  id: number;
  code?: string;
  customerName?: string;
  itemsCount: number;
  total: number;
  status: string;
  createdAt?: string;
};

export type WeeklySalesPoint = {
  day: string;     // Mon, Tue, ...
  amount: number;  // total revenue that day
};

export type MenuItemRow = {
  id: number;
  name: string;
  category?: string | null;
  price?: number | null;
  rating?: number | null;
  active: boolean;
  monthlyOrders?: number | null;
  imageUrl?: string | null;
};

/* ---------- Helpers ---------- */
function toShortDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" }); // Mon/Tue/...
}

/* ======================================================
   FETCHERS (use your existing controllers)
   ====================================================== */

/** Get recent orders by calling /api/orders and mapping on the client. */
export async function fetchRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const { data } = await api.get<any[]>("/api/orders");
  const list = Array.isArray(data) ? data : [];

  const sorted = [...list].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return sorted.slice(0, limit).map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    itemsCount: Array.isArray(o.items) ? o.items.length : 0,
    total: typeof o.totalAmount === "number" ? o.totalAmount : 0,
    status: o.status ?? "NEW",
    createdAt: o.createdAt,
  }));
}

/** Build weekly sales (last 7 days) from /api/orders COMPLETED totals. */
export async function fetchWeeklySales(): Promise<WeeklySalesPoint[]> {
  const { data } = await api.get<any[]>("/api/orders");
  const orders = Array.isArray(data) ? data : [];

  // last 7 days (oldest -> newest)
  const days: { start: Date; end: Date; label: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    days.push({ start, end, label: toShortDay(start) });
  }

  return days.map(({ start, end, label }) => {
    const amount = orders
      .filter(
        (o) =>
          o.status === "COMPLETED" &&
          o.createdAt &&
          new Date(o.createdAt) >= start &&
          new Date(o.createdAt) < end
      )
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { day: label, amount };
  });
}

/** Get the first N menu items for the “Menu Items” section. */
export async function fetchMenuItems(limit = 4): Promise<MenuItemRow[]> {
  const rid = typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;
  const restaurantId = rid ? Number(rid) : undefined;

  const { data } = await api.get<MenuItemRow[]>(
    `/api/menu/items${restaurantId ? `?restaurantId=${restaurantId}` : ""}`
  );

  const items = Array.isArray(data) ? data : [];
  return items.slice(0, limit).map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category ?? null,
    price: m.price ?? null,
    rating: m.rating ?? null,
    active: Boolean(m.active),
    monthlyOrders: m.monthlyOrders ?? null,
    imageUrl: m.imageUrl ?? null,
  }));
}

/**
 * Enable/Disable a menu item.
 *
 * ⚠️ Your current backend `PUT /api/menu/items/{id}` might require the FULL DTO.
 * If your update is partial, the object below is fine. If not, pass the full item.
 * Alternatively, add a PATCH endpoint `/api/menu/items/{id}/active?active=true`.
 */
export async function toggleMenuActive(
  id: number,
  active: boolean,
  current?: Partial<MenuItemRow>
): Promise<MenuItemRow> {
  // If your controller requires full DTO, ensure `payload` contains all fields.
  const payload = { ...(current ?? {}), active };

  const { data } = await api.put<MenuItemRow>(`/api/menu/items/${id}`, payload);
  return data;
}

/** Optional: client-only "logout" helper used by Topbar */
export async function logoutApi(): Promise<void> {
  try {
    await api.post("/auth/logout"); // will be ignored if not implemented
  } catch {}
}
