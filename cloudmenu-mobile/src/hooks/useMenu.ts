import { useAppSelector } from "./useStore";

export const useMenu = () => {
  return useAppSelector(state => state.menu.items);
};
