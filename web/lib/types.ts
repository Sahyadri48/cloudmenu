export type MenuItemDTO = {
  id?: number;
  restaurantId?: number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  prepTime?: number;
  category?: string;
  kitchenSection?: string;
  status?: string;
  imageUrl?: string;
  dietaryInfo?: string[];
  ingredients?: string;
  allergens?: string;
  addons?: { id?: number; name: string; price: number; type?: string }[];
};

export type OrderItemDTO = {
  id?: number;
  menuItemId: number;
  name?: string;
  quantity: number;
  basePrice: number;
  specialInstructions?: string;
  status?: string;
  addons?: { id?: number; name: string; price: number }[];
};

export type OrderDTO = {
  id?: number;
  restaurantId?: number;
  customerId?: number;
  orderNumber?: string;
  tableNumber: number;
  status?: string;
  totalAmount: number;
  items: OrderItemDTO[];
};
