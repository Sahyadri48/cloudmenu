import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { placeOrder } from "../../api/order.api";
import { CreateOrderRequest } from "./order.types";

export const submitOrder = createAsyncThunk(
  "order/submit",
  async (payload: CreateOrderRequest) => {
    return await placeOrder(payload);
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: { status: "IDLE", orderId: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitOrder.fulfilled, (state, action) => {
      state.orderId = action.payload.orderId;
      state.status = action.payload.status;
    });
  },
});

export default orderSlice.reducer;
