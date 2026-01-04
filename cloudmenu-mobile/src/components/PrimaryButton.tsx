import { TouchableOpacity, Text } from "react-native";

export default function PrimaryButton({ title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 14, backgroundColor: "#000", borderRadius: 6 }}
    >
      <Text style={{ color: "#fff", textAlign: "center" }}>{title}</Text>
    </TouchableOpacity>
  );
}
