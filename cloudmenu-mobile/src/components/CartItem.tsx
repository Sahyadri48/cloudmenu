import { View, Text } from "react-native";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
}

export default function CartItem({ item }: CartItemProps) {
  return (
    <View style={{ padding: 12, borderBottomWidth: 1 }}>
      <Text>{item.name}</Text>
      <Text>Qty: {item.quantity}</Text>
      <Text>₹{item.price * item.quantity}</Text>
    </View>
  );
}
