import apiClient from "./client";
import { CreateOrderRequest, OrderResponse } from "../features/order/order.types";

export const placeOrder = async (
  payload: CreateOrderRequest
): Promise<OrderResponse> => {
  const res = await apiClient.post("/orders", payload);
  return res.data;
};

export const getOrderStatus = async (orderId: string) => {
  const res = await apiClient.get(`/orders/${orderId}`);
  return res.data;
};
