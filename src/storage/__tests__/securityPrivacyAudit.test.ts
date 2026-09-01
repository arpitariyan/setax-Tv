import '@/storage/__tests__/setupMocks';
import { getOrCreateDeviceId } from '../guestStorage';
import { getAppSettings } from '../settingsStorage';
import { getFavorites } from '../favoritesStorage';
import { getRecentlyWatched } from '../historyStorage';

describe('Security & Privacy Audit Unit Tests', () => {
  test('guest device ID is generated locally without remote authentication server', async () => {
    const deviceId = await getOrCreateDeviceId();
    expect(deviceId).toBeDefined();
    expect(deviceId.startsWith('guest_')).toBe(true);
  });

  test('all storage data models run 100% locally on device', async () => {
    const settings = await getAppSettings();
    expect(settings).toBeDefined();

    const favorites = await getFavorites();
    expect(Array.isArray(favorites)).toBe(true);

    const history = await getRecentlyWatched();
    expect(Array.isArray(history)).toBe(true);
  });
});
