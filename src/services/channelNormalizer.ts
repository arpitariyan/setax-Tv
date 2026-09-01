import { Channel, ChannelFilterOptions, RawM3uItem, StreamCapabilities, StreamType } from '@/types/channel';

export const DEFAULT_CAPABILITIES: StreamCapabilities = {
  live: true,
  seekable: false,
  qualitySelection: false,
  audioTracks: false,
  subtitles: false,
  pictureInPicture: true,
};

/**
 * Normalizes raw M3U items into clean, strongly-typed Channel models.
 * Generates stable identifiers, deduplicates alternate streams, and normalizes categories.
 */
export class ChannelNormalizer {
  /**
   * Normalizes a full list of RawM3uItems and deduplicates identical channels by grouping alternate streams.
   */
  static normalizeCatalogue(rawItems: RawM3uItem[]): Channel[] {
    const channelMap = new Map<string, Channel>();

    for (const item of rawItems) {
      const normalized = ChannelNormalizer.normalizeRawItem(item);
      if (!normalized) continue;

      const existing = channelMap.get(normalized.id);
      if (existing) {
        // Merge alternate stream URL if distinct
        if (
          existing.streamUrl !== normalized.streamUrl &&
          !existing.alternateStreamUrls?.includes(normalized.streamUrl)
        ) {
          const alternateStreamUrls = [
            ...(existing.alternateStreamUrls || []),
            normalized.streamUrl,
          ];
          channelMap.set(normalized.id, {
            ...existing,
            alternateStreamUrls,
          });
        }
      } else {
        channelMap.set(normalized.id, normalized);
      }
    }

    return Array.from(channelMap.values());
  }

  /**
   * Normalizes a single RawM3uItem into a Channel object.
   */
  static normalizeRawItem(item: RawM3uItem): Channel | null {
    if (!item.streamUrl || !item.streamUrl.trim()) {
      return null;
    }

    const cleanName = ChannelNormalizer.cleanName(item.name || item.tvgName || 'Unknown Channel');
    const normalizedName = cleanName.toLowerCase();
    const id = ChannelNormalizer.generateStableId(item, cleanName);

    const streamType = ChannelNormalizer.detectStreamType(item.streamUrl);
    const categories = ChannelNormalizer.extractCategories(item.groupTitle, item.category);
    const languages = item.language ? [item.language.trim()] : [];

    return {
      id,
      name: cleanName,
      normalizedName,
      logo: item.logo || item.tvgLogo || undefined,
      country: item.country || undefined,
      countryCode: item.country ? item.country.toUpperCase() : undefined,
      languages,
      categories,
      streamUrl: item.streamUrl.trim(),
      streamType,
      epgId: item.tvgId || item.id || undefined,
      source: 'iptv-org',
      status: 'unknown',
      lastChecked: null,
      metadataVersion: 1,
      capabilities: { ...DEFAULT_CAPABILITIES },
    };
  }

  /**
   * Generates a deterministic, stable channel ID (never an array index!).
   */
  static generateStableId(item: RawM3uItem, cleanName: string): string {
    const preferredId = item.tvgId || item.id;
    if (preferredId && preferredId.trim()) {
      return `tvg_${ChannelNormalizer.slugify(preferredId)}`;
    }
    const baseSlug = ChannelNormalizer.slugify(cleanName.replace(/1080p|720p|4k|hd|fhd/gi, ''));
    const countryPart = item.country ? `_${ChannelNormalizer.slugify(item.country)}` : '';
    return `ch_${baseSlug}${countryPart}`;
  }

  static cleanName(name: string): string {
    return name
      .replace(/\[.*?\]|\(.*?\)/g, (match) => {
        // Retain 1080p or HD markers if useful, otherwise strip clutter
        if (/1080p|720p|4k|hd|fhd/i.test(match)) return match;
        return '';
      })
      .replace(/\s+/g, ' ')
      .trim();
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static detectStreamType(url: string): StreamType {
    const lower = url.toLowerCase();
    if (lower.includes('.m3u8') || lower.includes('m3u8')) return 'hls';
    if (lower.includes('.mpd')) return 'dash';
    if (lower.includes('.mp4')) return 'mp4';
    return 'unknown';
  }

  static extractCategories(groupTitle?: string, category?: string): string[] {
    const set = new Set<string>();
    if (groupTitle) {
      groupTitle.split(/;|\||\//).forEach((cat) => {
        const trimmed = cat.trim();
        if (trimmed) set.add(trimmed);
      });
    }
    if (category) {
      category.split(/;|\||\//).forEach((cat) => {
        const trimmed = cat.trim();
        if (trimmed) set.add(trimmed);
      });
    }
    return Array.from(set);
  }

  /**
   * Filters channels fast based on search query, country, category, status, and favorites.
   */
  static filterChannels(channels: Channel[], options: ChannelFilterOptions): Channel[] {
    const {
      searchQuery,
      country,
      language,
      category,
      status,
      favoritesOnly,
      favoriteIds = [],
    } = options;

    const query = searchQuery ? searchQuery.trim().toLowerCase() : null;
    const favSet = new Set(favoriteIds);

    return channels.filter((ch) => {
      if (favoritesOnly && !favSet.has(ch.id)) {
        return false;
      }

      if (status && status !== 'all' && ch.status !== status) {
        return false;
      }

      if (country && country !== 'all') {
        const chCountry = (ch.country || ch.countryCode || '').toLowerCase();
        if (!chCountry.includes(country.toLowerCase())) {
          return false;
        }
      }

      if (language && language !== 'all') {
        const hasLang = ch.languages.some((l) => l.toLowerCase().includes(language.toLowerCase()));
        if (!hasLang) return false;
      }

      if (category && category !== 'all') {
        const hasCat = ch.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()));
        if (!hasCat) return false;
      }

      if (query) {
        const matchesName = ch.normalizedName.includes(query);
        const matchesCountry = (ch.country || '').toLowerCase().includes(query);
        const matchesCategory = ch.categories.some((c) => c.toLowerCase().includes(query));
        if (!matchesName && !matchesCountry && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }
}
