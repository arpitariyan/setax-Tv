import { parseM3u } from '@/parsers/m3uParser';
import { readChannelCache, saveChannelCache } from '@/storage';
import { M3uParseDiagnostics, RawM3uItem } from '@/types/channel';

export const PRIMARY_IPTV_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';

export interface LoadPlaylistOptions {
  forceRefresh?: boolean;
  sourceUrl?: string;
}

export interface LoadPlaylistResult {
  items: RawM3uItem[];
  fromCache: boolean;
  fetchedAt: number;
  diagnostics?: M3uParseDiagnostics;
}

/**
 * Service module for fetching and ingesting public IPTV M3U catalogues.
 */
export class PlaylistService {
  /**
   * Loads playlist following local-first strategy:
   * 1. Read local cache immediately.
   * 2. If no cache or forced refresh, fetch remote source, parse, and save cache.
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

    return await PlaylistService.fetchAndParseRemote(sourceUrl);
  }

  /**
   * Fetches remote M3U playlist, parses entries, and caches output locally.
   */
  static async fetchAndParseRemote(sourceUrl: string = PRIMARY_IPTV_PLAYLIST_URL): Promise<LoadPlaylistResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout safeguard

    try {
      const response = await fetch(sourceUrl, {
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

      if (parseResult.items.length > 0) {
        await saveChannelCache(parseResult.items, sourceUrl);
      }

      return {
        items: parseResult.items,
        fromCache: false,
        fetchedAt: Date.now(),
        diagnostics: parseResult.diagnostics,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[PlaylistService] Remote fetch failed, trying local fallback cache', error);
      const cached = await readChannelCache<RawM3uItem>();
      if (cached && cached.channels) {
        return {
          items: cached.channels,
          fromCache: true,
          fetchedAt: cached.fetchedAt,
        };
      }
      throw error;
    }
  }
}
