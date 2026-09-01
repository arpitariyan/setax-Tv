import { Channel, ChannelFilterOptions, RawM3uItem, StreamCapabilities, StreamType } from '@/types/channel';

export const DEFAULT_CAPABILITIES: StreamCapabilities = {
  live: true,
  seekable: false,
  qualitySelection: false,
  audioTracks: false,
  subtitles: false,
  pictureInPicture: true,
};

export const INDIAN_LANGUAGES_SET = new Set([
  'hindi', 'tamil', 'telugu', 'malayalam', 'bengali', 'marathi',
  'kannada', 'gujarati', 'punjabi', 'panjabi', 'bhojpuri', 'assamese',
  'oria', 'odia', 'chhattisgarhi', 'haryanvi', 'maithili', 'santali'
]);

/**
 * Normalizes raw M3U items into clean, strongly-typed Channel models.
 * Generates stable identifiers, deduplicates alternate streams, and prioritizes Indian channels.
 */
export class ChannelNormalizer {
  /**
   * Normalizes a full list of RawM3uItems and deduplicates identical channels by grouping alternate streams.
   * Sorts Indian channels to the top of the catalogue.
   */
  static normalizeCatalogue(rawItems: RawM3uItem[]): Channel[] {
    const channelMap = new Map<string, Channel>();

    for (const item of rawItems) {
      const normalized = ChannelNormalizer.normalizeRawItem(item);
      if (!normalized) continue;

      const existing = channelMap.get(normalized.id);
      if (existing) {
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

    const allChannels = Array.from(channelMap.values());

    // Priority Sort: Indian channels first, then rest
    return allChannels.sort((a, b) => {
      const aIsIndia = ChannelNormalizer.isIndiaChannel(a);
      const bIsIndia = ChannelNormalizer.isIndiaChannel(b);

      if (aIsIndia && !bIsIndia) return -1;
      if (!aIsIndia && bIsIndia) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  static isIndiaChannel(channel: Channel): boolean {
    if (channel.countryCode === 'IN' || channel.country?.toLowerCase() === 'india') {
      return true;
    }
    return channel.languages.some((l) => INDIAN_LANGUAGES_SET.has(l.toLowerCase()));
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
    const categories = ChannelNormalizer.extractCategories(cleanName, item.groupTitle, item.category);
    const languages = item.language ? [item.language.trim()] : [];

    const rawCountry = (item.tvgCountry || item.country || '').trim();
    let countryCode = rawCountry ? rawCountry.toUpperCase() : undefined;
    let country = rawCountry;

    // Auto-detect India from language or group title or channel name if unspecified
    const isIndiaLang = languages.some((l) => INDIAN_LANGUAGES_SET.has(l.toLowerCase()));
    const isIndiaGroup = categories.some((c) => c.toLowerCase().includes('india'));
    const isIndiaName = /india|tv9|abp|aajtak|ndtv|zeer|dd|star|sony|b4u|etv|goldmines/i.test(cleanName);

    if (countryCode === 'IN' || isIndiaLang || isIndiaGroup || isIndiaName) {
      countryCode = 'IN';
      country = 'India';
    }

    return {
      id,
      name: cleanName,
      normalizedName,
      logo: item.logo || item.tvgLogo || undefined,
      country: country || undefined,
      countryCode,
      subdivision: item.subdivision || undefined,
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
   * Generates a deterministic, stable channel ID.
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

  static extractCategories(name: string, groupTitle?: string, category?: string): string[] {
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

    // Infer category ONLY if no categories were parsed from groupTitle or category attributes
    if (set.size === 0) {
      const lowerName = name.toLowerCase();
      if (/news|khabar|samachar|24|taas|kalak|ghanta|today|wion|lokshahi|express/i.test(lowerName)) {
        set.add('News');
      } else if (/cinema|movies|filmi|cineplex|film|goldmines|kadak|superhits|bhojpuri/i.test(lowerName)) {
        set.add('Movies');
      } else if (/music|jalwa|jhakaas|tashan|songs|beats|insync|dhoom|isai|balle|yrf|zoom/i.test(lowerName)) {
        set.add('Music');
      } else if (/bhajan|aastha|bhakti|sanskar|sadhna|divya|peace|satsang|svbc|prayer|god|jesus|shubh|dharam|hare|krsna|salvation|hosanna/i.test(lowerName)) {
        set.add('Devotional');
      } else if (/sports|chakde|khel/i.test(lowerName)) {
        set.add('Sports');
      } else if (/kidz|cartoon|junior|animation|wow/i.test(lowerName)) {
        set.add('Kids');
      } else {
        set.add('General');
      }
    }
    return Array.from(set);
  }

  /**
   * Filters channels fast based on search query, country, language, state/subdivision, category, status, and favorites.
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
      indiaOnly,
      subdivision,
    } = options;

    const query = searchQuery ? searchQuery.trim().toLowerCase() : null;
    const favSet = new Set(favoriteIds);

    return channels.filter((ch) => {
      if (favoritesOnly && !favSet.has(ch.id)) {
        return false;
      }

      if (indiaOnly && !ChannelNormalizer.isIndiaChannel(ch)) {
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

      if (subdivision && subdivision !== 'all') {
        const chSub = (ch.subdivision || ch.categories.join(' ')).toLowerCase();
        if (!chSub.includes(subdivision.toLowerCase())) {
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
