export interface CreateOrderRequest {
  restaurantId: string;
  tableNumber: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}

export interface OrderResponse {
  orderId: string;
  status: string;
}
