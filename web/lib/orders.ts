// lib/orders.ts
import { api } from "@/lib/api";

/* ---- Types (match your backend DTO) ---- */
export type OrderAddonDTO = { id: number; name: string; price: number };
export type OrderItemDTO = {
  id: number;
  menuItemId: number;
  name?: string;
  quantity: number;
  basePrice: number;
  specialInstructions?: string;
  status: string; // PREPARING | READY | SERVED | CANCELLED ...
  addons?: OrderAddonDTO[];
};
export type OrderDTO = {
  id: number;
  restaurantId: number;
  customerId: number;
  orderNumber: string;
  tableNumber: number;
  status: "NEW" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "COMPLETED" | string;
  totalAmount: number;
  items: OrderItemDTO[];
};

/* ---- API calls ---- */

// List orders (optionally filter by status)
export async function fetchOrders(status?: string): Promise<OrderDTO[]> {
  const res = await api.get<OrderDTO[]>("/api/orders", { params: status ? { status } : {} });
  return res.data ?? [];
}

// Update whole order status
export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  await api.patch(`/api/orders/${orderId}/status`, { status });
}

// Update a single item status
export async function updateOrderItemStatus(itemId: number, status: string): Promise<void> {
  await api.patch(`/api/orders/items/${itemId}/status`, { status });
}
