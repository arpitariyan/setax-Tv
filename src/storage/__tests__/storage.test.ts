import './setupMocks';
import {
  getOrCreateDeviceId,
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  clearFavorites,
  getRecentlyWatched,
  addRecentlyWatched,
  clearRecentlyWatched,
  saveChannelCache,
  readChannelCache,
  clearChannelCache,
  CACHE_SCHEMA_VERSION,
} from '../index';

describe('Local Storage Architecture Unit Tests', () => {
  test('guestStorage returns local anonymous device ID', async () => {
    const id1 = await getOrCreateDeviceId();
    expect(id1).toBeDefined();
    expect(typeof id1).toBe('string');
    expect(id1.startsWith('guest_')).toBe(true);

    const id2 = await getOrCreateDeviceId();
    expect(id2).toBe(id1);
  });

  test('settingsStorage manages preferences cleanly', async () => {
    const initial = await getAppSettings();
    expect(initial.theme).toBe('dark');

    const updated = await saveAppSettings({ selectedCountry: 'US', theme: 'light' });
    expect(updated.selectedCountry).toBe('US');
    expect(updated.theme).toBe('light');

    const reset = await resetAppSettings();
    expect(reset.selectedCountry).toBeNull();
    expect(reset.theme).toBe('dark');
  });

  test('favoritesStorage manages favorite channel list', async () => {
    await clearFavorites();
    let favs = await getFavorites();
    expect(favs).toEqual([]);

    await addFavorite('ch-101');
    await addFavorite('ch-102');
    expect(await isFavorite('ch-101')).toBe(true);

    favs = await getFavorites();
    expect(favs).toContain('ch-101');
    expect(favs).toContain('ch-102');

    await removeFavorite('ch-101');
    expect(await isFavorite('ch-101')).toBe(false);
  });

  test('historyStorage maintains bounded history up to 20 items', async () => {
    await clearRecentlyWatched();
    for (let i = 1; i <= 25; i++) {
      await addRecentlyWatched(`ch-${i}`);
    }

    const history = await getRecentlyWatched();
    expect(history.length).toBe(20);
    expect(history[0].channelId).toBe('ch-25');
  });

  test('channelCacheStorage handles cache envelopes & schema versioning', async () => {
    await clearChannelCache();
    const mockChannels = [
      { id: 'ch-1', name: 'BBC News' },
      { id: 'ch-2', name: 'CNN' },
    ];

    await saveChannelCache(mockChannels);
    const cache = await readChannelCache();

    expect(cache).not.toBeNull();
    expect(cache?.schemaVersion).toBe(CACHE_SCHEMA_VERSION);
    expect(cache?.channels.length).toBe(2);

    await clearChannelCache();
    const cleared = await readChannelCache();
    expect(cleared).toBeNull();
  });
});
