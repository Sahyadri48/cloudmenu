import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchMenuByRestaurant } from "../../api/menu.api";
import { MenuItem } from "./menu.types";

interface MenuState {
  items: MenuItem[];
  loading: boolean;
}

const initialState: MenuState = {
  items: [],
  loading: false,
};

export const loadMenu = createAsyncThunk(
  "menu/load",
  async (restaurantId: string) => {
    return await fetchMenuByRestaurant(restaurantId);
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMenu.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadMenu.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  },
});

export default menuSlice.reducer;
