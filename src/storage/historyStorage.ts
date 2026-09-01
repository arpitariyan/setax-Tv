import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  channelId: string;
  timestamp: number;
}

const HISTORY_KEY = '@live_tv_history_v1';
const MAX_HISTORY_ITEMS = 20;

export async function getRecentlyWatched(): Promise<HistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[historyStorage] Failed reading watch history', error);
    return [];
  }
}

export async function addRecentlyWatched(channelId: string): Promise<HistoryItem[]> {
  try {
    const current = await getRecentlyWatched();
    const filtered = current.filter((item) => item.channelId !== channelId);
    const updated = [{ channelId, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[historyStorage] Failed adding watch history', error);
    return getRecentlyWatched();
  }
}

export async function clearRecentlyWatched(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('[historyStorage] Failed clearing history', error);
  }
}
