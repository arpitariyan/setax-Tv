import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = '@live_tv_guest_device_id_v1';

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves or creates a 100% local, anonymous guest device identifier.
 * Never requires a remote account or backend database.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    if (Platform.OS !== 'web') {
      const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (existing) {
        return existing;
      }
      const newId = `guest_${generateUuid()}`;
      await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
      return newId;
    } else {
      const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (existing) {
        return existing;
      }
      const newId = `guest_${generateUuid()}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
      return newId;
    }
  } catch (error) {
    console.warn('[guestStorage] SecureStore unavailable, falling back to in-memory ID', error);
    return `guest_fallback_${generateUuid()}`;
  }
}
