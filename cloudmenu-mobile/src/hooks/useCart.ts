import { useAppSelector } from "./useStore";

export const useCart = () => {
  return useAppSelector(state => state.cart.items);
};
