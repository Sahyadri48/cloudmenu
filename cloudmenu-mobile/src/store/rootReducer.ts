import { combineReducers } from "@reduxjs/toolkit";
import menuReducer from "../features/menu/menu.slice";
import cartReducer from "../features/cart/cart.slice";
import orderReducer from "../features/order/order.slice";

export const rootReducer = combineReducers({
  menu: menuReducer,
  cart: cartReducer,
  order: orderReducer,
});
