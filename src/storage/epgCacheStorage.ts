import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { EpgCacheEnvelope, EpgProgram } from '@/types/epg';

export const EPG_CACHE_SCHEMA_VERSION = 1;
const EPG_CACHE_FILE_NAME = 'iptv_epg_cache_v1.json';
const WEB_EPG_CACHE_KEY = '@live_tv_epg_cache_v1';

function getEpgCacheFile(): File {
  return new File(Paths.document, EPG_CACHE_FILE_NAME);
}

export async function saveEpgCache(
  programsByChannel: Record<string, EpgProgram[]>
): Promise<void> {
  const envelope: EpgCacheEnvelope = {
    schemaVersion: EPG_CACHE_SCHEMA_VERSION,
    fetchedAt: Date.now(),
    programsByChannel,
  };

  const jsonString = JSON.stringify(envelope);

  if (Platform.OS !== 'web') {
    try {
      const file = getEpgCacheFile();
      await file.write(jsonString);
    } catch (error) {
      console.error('[epgCacheStorage] FileSystem save error', error);
    }
  } else {
    try {
      await AsyncStorage.setItem(WEB_EPG_CACHE_KEY, jsonString);
    } catch (error) {
      console.error('[epgCacheStorage] AsyncStorage web save error', error);
    }
  }
}

export async function readEpgCache(): Promise<EpgCacheEnvelope | null> {
  let jsonString: string | null = null;

  if (Platform.OS !== 'web') {
    try {
      const file = getEpgCacheFile();
      if (file.exists) {
        jsonString = await file.text();
      }
    } catch (error) {
      console.warn('[epgCacheStorage] Error reading EPG cache file', error);
    }
  } else {
    try {
      jsonString = await AsyncStorage.getItem(WEB_EPG_CACHE_KEY);
    } catch (error) {
      console.warn('[epgCacheStorage] Error reading web EPG cache', error);
    }
  }

  if (!jsonString) return null;

  try {
    const envelope = JSON.parse(jsonString) as EpgCacheEnvelope;
    if (envelope.schemaVersion !== EPG_CACHE_SCHEMA_VERSION) {
      console.warn('[epgCacheStorage] Schema version mismatch, invalidating EPG cache');
      await clearEpgCache();
      return null;
    }
    return envelope;
  } catch (error) {
    console.error('[epgCacheStorage] Corrupt EPG JSON cache, removing', error);
    await clearEpgCache();
    return null;
  }
}

export async function clearEpgCache(): Promise<void> {
  if (Platform.OS !== 'web') {
    try {
      const file = getEpgCacheFile();
      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      console.error('[epgCacheStorage] Error clearing FileSystem cache', error);
    }
  } else {
    try {
      await AsyncStorage.removeItem(WEB_EPG_CACHE_KEY);
    } catch (error) {
      console.error('[epgCacheStorage] Error clearing web cache', error);
    }
  }
}
