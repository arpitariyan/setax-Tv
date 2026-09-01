import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@live_tv_favorites_v1';

export async function getFavorites(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[favoritesStorage] Failed reading favorites', error);
    return [];
  }
}

export async function addFavorite(channelId: string): Promise<string[]> {
  try {
    const current = await getFavorites();
    if (!current.includes(channelId)) {
      const updated = [channelId, ...current];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (error) {
    console.error('[favoritesStorage] Failed adding favorite', error);
    return getFavorites();
  }
}

export async function removeFavorite(channelId: string): Promise<string[]> {
  try {
    const current = await getFavorites();
    const updated = current.filter((id) => id !== channelId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[favoritesStorage] Failed removing favorite', error);
    return getFavorites();
  }
}

export async function isFavorite(channelId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(channelId);
}

export async function clearFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('[favoritesStorage] Failed clearing favorites', error);
  }
}
