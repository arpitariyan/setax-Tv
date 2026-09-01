import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  selectedCountry: string | null;
  selectedLanguage: string | null;
  selectedCategory: string | null;
  onboardingCompleted: boolean;
  sleepTimerMinutes: number | null;
  parentalPin: string | null;
  playerAutoPlay: boolean;
}

const SETTINGS_KEY = '@live_tv_app_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  selectedCountry: null,
  selectedLanguage: null,
  selectedCategory: null,
  onboardingCompleted: false,
  sleepTimerMinutes: null,
  parentalPin: null,
  playerAutoPlay: true,
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!json) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(json);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('[settingsStorage] Error reading settings, returning defaults', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const current = await getAppSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[settingsStorage] Error saving settings', error);
    throw error;
  }
}

export async function resetAppSettings(): Promise<AppSettings> {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[settingsStorage] Error resetting settings', error);
    return DEFAULT_SETTINGS;
  }
}
