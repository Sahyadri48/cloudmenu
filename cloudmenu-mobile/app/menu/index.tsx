import { FlatList, ActivityIndicator } from "react-native";

import { useAppSelector } from "@/hooks/useStore";
import MenuItemCard from "@/components/MenuItemCard";

export default function MenuScreen() {
  const { items, loading } = useAppSelector(state => state.menu);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MenuItemCard item={item} />}
    />
  );
}
