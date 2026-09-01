import { parseM3u } from '@/parsers/m3uParser';
import { readChannelCache, saveChannelCache } from '@/storage';
import { M3uParseDiagnostics, RawM3uItem } from '@/types/channel';
import { BUNDLED_INDIAN_CHANNELS_M3U } from '@/data/indianChannelsM3u';

export const PRIMARY_IPTV_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';
export const INDIA_IPTV_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

export const INDIA_SUBDIVISION_PLAYLISTS: Record<string, string> = {
  'Andhra Pradesh': 'https://iptv-org.github.io/iptv/subdivisions/in-ap.m3u',
  'Delhi': 'https://iptv-org.github.io/iptv/subdivisions/in-dl.m3u',
  'Karnataka': 'https://iptv-org.github.io/iptv/subdivisions/in-ka.m3u',
  'Kerala': 'https://iptv-org.github.io/iptv/subdivisions/in-kl.m3u',
  'Maharashtra': 'https://iptv-org.github.io/iptv/subdivisions/in-mh.m3u',
  'Tamil Nadu': 'https://iptv-org.github.io/iptv/subdivisions/in-tn.m3u',
};

export const INDIA_LANGUAGE_PLAYLISTS: Record<string, string> = {
  'Hindi': 'https://iptv-org.github.io/iptv/languages/hin.m3u',
  'Tamil': 'https://iptv-org.github.io/iptv/languages/tam.m3u',
  'Telugu': 'https://iptv-org.github.io/iptv/languages/tel.m3u',
  'Malayalam': 'https://iptv-org.github.io/iptv/languages/mal.m3u',
  'Bengali': 'https://iptv-org.github.io/iptv/languages/ben.m3u',
  'Marathi': 'https://iptv-org.github.io/iptv/languages/mar.m3u',
  'Kannada': 'https://iptv-org.github.io/iptv/languages/kan.m3u',
  'Gujarati': 'https://iptv-org.github.io/iptv/languages/guj.m3u',
  'Punjabi': 'https://iptv-org.github.io/iptv/languages/pan.m3u',
  'Bhojpuri': 'https://iptv-org.github.io/iptv/languages/bho.m3u',
  'Assamese': 'https://iptv-org.github.io/iptv/languages/asm.m3u',
  'Odia': 'https://iptv-org.github.io/iptv/languages/ori.m3u',
};

export interface LoadPlaylistOptions {
  forceRefresh?: boolean;
  sourceUrl?: string;
  prioritizeIndia?: boolean;
}

export interface LoadPlaylistResult {
  items: RawM3uItem[];
  fromCache: boolean;
  fetchedAt: number;
  diagnostics?: M3uParseDiagnostics;
}

/**
 * Service module for fetching and ingesting public IPTV M3U catalogues with India priority.
 */
export class PlaylistService {
  /**
   * Loads playlist following local-first strategy:
   * 1. Read local cache immediately.
   * 2. If no cache or forced refresh, fetch remote sources, parse, and save cache.
   */
  static async loadPlaylist(options: LoadPlaylistOptions = {}): Promise<LoadPlaylistResult> {
    const sourceUrl = options.sourceUrl || PRIMARY_IPTV_PLAYLIST_URL;

    if (!options.forceRefresh) {
      const cached = await readChannelCache<RawM3uItem>();
      if (cached && cached.channels && cached.channels.length > 0) {
        return {
          items: cached.channels,
          fromCache: true,
          fetchedAt: cached.fetchedAt,
        };
      }
    }

    return await PlaylistService.fetchAndParseAggregated(sourceUrl);
  }

  /**
   * Bundles local static Indian M3U dataset and fetches remote India + global playlists concurrently.
   */
  static async fetchAndParseAggregated(sourceUrl: string = PRIMARY_IPTV_PLAYLIST_URL): Promise<LoadPlaylistResult> {
    try {
      // 1. Parse static bundled Indian playlist for instant offline availability
      const bundledResult = parseM3u(BUNDLED_INDIAN_CHANNELS_M3U);
      const bundledItems = bundledResult.items.map((item) => ({
        ...item,
        tvgCountry: item.tvgCountry || 'IN',
        country: item.country || 'India',
      }));

      // 2. Concurrently fetch primary playlist and India dedicated remote playlist
      const [primaryRes, indiaRes] = await Promise.allSettled([
        PlaylistService.fetchAndParseSingleUrl(sourceUrl),
        PlaylistService.fetchAndParseSingleUrl(INDIA_IPTV_PLAYLIST_URL),
      ]);

      const remoteIndiaItems = indiaRes.status === 'fulfilled' ? indiaRes.value.items : [];
      const primaryItems = primaryRes.status === 'fulfilled' ? primaryRes.value.items : [];

      const taggedRemoteIndiaItems = remoteIndiaItems.map((item) => ({
        ...item,
        tvgCountry: item.tvgCountry || 'IN',
        country: item.country || 'India',
      }));

      // 3. Deduplicate and merge: Bundled Indian Channels FIRST -> Remote India -> Primary
      const combinedItems: RawM3uItem[] = [];
      const urlSet = new Set<string>();

      bundledItems.forEach((item) => {
        if (item.streamUrl && !urlSet.has(item.streamUrl)) {
          urlSet.add(item.streamUrl);
          combinedItems.push(item);
        }
      });

      taggedRemoteIndiaItems.forEach((item) => {
        if (item.streamUrl && !urlSet.has(item.streamUrl)) {
          urlSet.add(item.streamUrl);
          combinedItems.push(item);
        }
      });

      primaryItems.forEach((item) => {
        if (item.streamUrl && !urlSet.has(item.streamUrl)) {
          urlSet.add(item.streamUrl);
          combinedItems.push(item);
        }
      });

      if (combinedItems.length > 0) {
        await saveChannelCache(combinedItems, sourceUrl);
      }

      return {
        items: combinedItems,
        fromCache: false,
        fetchedAt: Date.now(),
      };
    } catch (error) {
      console.warn('[PlaylistService] Aggregated fetch failed, loading local cache', error);
      const cached = await readChannelCache<RawM3uItem>();
      if (cached && cached.channels) {
        return {
          items: cached.channels,
          fromCache: true,
          fetchedAt: cached.fetchedAt,
        };
      }

      // Fallback to static bundled Indian channels if no cache and fetch failed
      const bundledResult = parseM3u(BUNDLED_INDIAN_CHANNELS_M3U);
      return {
        items: bundledResult.items,
        fromCache: true,
        fetchedAt: Date.now(),
      };
    }
  }

  /**
   * Helper to fetch and parse a single M3U URL with timeout safeguard.
   */
  private static async fetchAndParseSingleUrl(url: string): Promise<LoadPlaylistResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MobileTvLive/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const parseResult = parseM3u(text);

      return {
        items: parseResult.items,
        fromCache: false,
        fetchedAt: Date.now(),
        diagnostics: parseResult.diagnostics,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
