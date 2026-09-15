import AsyncStorage from "@react-native-async-storage/async-storage";

type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getBrowserStorage(): BrowserStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export async function getPersistentItem(key: string): Promise<string | null> {
  const browserStorage = getBrowserStorage();
  if (browserStorage) return browserStorage.getItem(key);
  return AsyncStorage.getItem(key);
}

export async function setPersistentItem(key: string, value: string): Promise<void> {
  const browserStorage = getBrowserStorage();
  if (browserStorage) {
    browserStorage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export async function removePersistentItem(key: string): Promise<void> {
  const browserStorage = getBrowserStorage();
  if (browserStorage) {
    browserStorage.removeItem(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}
