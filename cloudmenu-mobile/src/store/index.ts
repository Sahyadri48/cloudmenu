import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "../features/menu/menu.slice";
import cartReducer from "../features/cart/cart.slice";
import orderReducer from "../features/order/order.slice";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
