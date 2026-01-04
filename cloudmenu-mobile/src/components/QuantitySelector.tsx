import { View, Button, Text } from "react-native";

export default function QuantitySelector({ value, onChange }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Button title="-" onPress={() => onChange(value - 1)} />
      <Text style={{ marginHorizontal: 8 }}>{value}</Text>
      <Button title="+" onPress={() => onChange(value + 1)} />
    </View>
  );
}
