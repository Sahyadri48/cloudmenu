import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = (key: string, value: string) =>
  AsyncStorage.setItem(key, value);

export const getItem = (key: string) =>
  AsyncStorage.getItem(key);
