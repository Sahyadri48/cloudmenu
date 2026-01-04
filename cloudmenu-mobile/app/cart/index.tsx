import { View, FlatList } from "react-native";
import { useRouter } from "expo-router";

import { useAppSelector } from "@/hooks/useStore";
import CartItem from "@/components/CartItem";
import PrimaryButton from "@/components/PrimaryButton";

export default function CartScreen() {
  const router = useRouter();
  const cart = useAppSelector(state => state.cart.items);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItem item={item} />}
      />
      <PrimaryButton
        title="Place Order"
        onPress={() => router.push("/order")}
      />
    </View>
  );
}

