import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const CACHE_SCHEMA_VERSION = 1;

export interface ChannelCacheEnvelope<T = any> {
  schemaVersion: number;
  fetchedAt: number;
  sourceUrl: string;
  channels: T[];
}

const CACHE_FILE_NAME = 'iptv_channel_cache_v1.json';
const WEB_CACHE_KEY = '@live_tv_channel_cache_v1';

function getCacheFile(): File {
  return new File(Paths.document, CACHE_FILE_NAME);
}

export async function saveChannelCache<T = any>(
  channels: T[],
  sourceUrl: string = 'https://iptv-org.github.io/iptv/index.m3u'
): Promise<void> {
  const envelope: ChannelCacheEnvelope<T> = {
    schemaVersion: CACHE_SCHEMA_VERSION,
    fetchedAt: Date.now(),
    sourceUrl,
    channels,
  };

  const jsonString = JSON.stringify(envelope);

  if (Platform.OS !== 'web') {
    try {
      const cacheFile = getCacheFile();
      await cacheFile.write(jsonString);
    } catch (error) {
      console.error('[channelCacheStorage] FileSystem save error', error);
    }
  } else {
    try {
      await AsyncStorage.setItem(WEB_CACHE_KEY, jsonString);
    } catch (error) {
      console.error('[channelCacheStorage] AsyncStorage web save error', error);
    }
  }
}

export async function readChannelCache<T = any>(): Promise<ChannelCacheEnvelope<T> | null> {
  let jsonString: string | null = null;

  if (Platform.OS !== 'web') {
    try {
      const cacheFile = getCacheFile();
      if (cacheFile.exists) {
        jsonString = await cacheFile.text();
      }
    } catch (error) {
      console.warn('[channelCacheStorage] Error reading cache file', error);
    }
  } else {
    try {
      jsonString = await AsyncStorage.getItem(WEB_CACHE_KEY);
    } catch (error) {
      console.warn('[channelCacheStorage] Error reading web cache', error);
    }
  }

  if (!jsonString) return null;

  try {
    const envelope = JSON.parse(jsonString) as ChannelCacheEnvelope<T>;
    if (envelope.schemaVersion !== CACHE_SCHEMA_VERSION) {
      console.warn('[channelCacheStorage] Schema version mismatch, invalidating cache');
      await clearChannelCache();
      return null;
    }
    return envelope;
  } catch (error) {
    console.error('[channelCacheStorage] Corrupt JSON cache detected, removing', error);
    await clearChannelCache();
    return null;
  }
}

export async function clearChannelCache(): Promise<void> {
  if (Platform.OS !== 'web') {
    try {
      const cacheFile = getCacheFile();
      if (cacheFile.exists) {
        cacheFile.delete();
      }
    } catch (error) {
      console.error('[channelCacheStorage] Error clearing FileSystem cache', error);
    }
  } else {
    try {
      await AsyncStorage.removeItem(WEB_CACHE_KEY);
    } catch (error) {
      console.error('[channelCacheStorage] Error clearing web cache', error);
    }
  }
}
