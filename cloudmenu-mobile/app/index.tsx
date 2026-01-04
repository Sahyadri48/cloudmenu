import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/hooks/useStore";
import { loadMenu } from "@/features/menu/menu.slice";

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    try {
      setScanned(true);
      const parsed = JSON.parse(data);
      const { restaurantId, tableNumber } = parsed;

      dispatch(loadMenu(restaurantId));

      router.replace({
        pathname: "/menu",
        params: { restaurantId, tableNumber },
      });
    } catch {
      alert("Invalid QR Code");
      setScanned(false);
    }
  };

  if (!permission?.granted) {
    return <Text>Requesting camera permission...</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
