import { View, Text, Button } from "react-native";
import { MenuItem } from "@/features/menu/menu.types";
import { useAppDispatch } from "@/hooks/useStore";
import { addToCart } from "@/features/cart/cart.slice";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const dispatch = useAppDispatch();

  return (
    <View style={{ padding: 12, borderBottomWidth: 1 }}>
      <Text>{item.name}</Text>
      <Text>₹{item.price}</Text>
      <Button title="Add" onPress={() => dispatch(addToCart(item))} />
    </View>
  );
}
