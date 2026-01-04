import apiClient from "./client";
import { MenuItem } from "../features/menu/menu.types";

export const fetchMenuByRestaurant = async (
  restaurantId: string
): Promise<MenuItem[]> => {
  const res = await apiClient.get(`/menus/restaurant/${restaurantId}`);
  return res.data;
};
