import { View, Text } from "react-native";

export default function SuccessScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>
        🎉 Order Placed Successfully
      </Text>
      <Text>Your food is being prepared</Text>
    </View>
  );
}
