import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { submitOrder } from "@/features/order/order.slice";
import PrimaryButton from "@/components/PrimaryButton";

export default function OrderScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart.items);
  const { restaurantId, tableNumber } = useLocalSearchParams();

  const confirmOrder = async () => {
    await dispatch(
      submitOrder({
        restaurantId: restaurantId as string,
        tableNumber: tableNumber as string,
        items: cart.map(i => ({
          menuItemId: i.id,
          quantity: i.quantity,
        })),
      })
    );

    router.replace("/success");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Confirm Order</Text>
      <PrimaryButton title="Confirm Order" onPress={confirmOrder} />
    </View>
  );
}
