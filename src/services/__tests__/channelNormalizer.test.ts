import { ChannelNormalizer } from '../channelNormalizer';
import { RawM3uItem } from '@/types/channel';

describe('Channel Normalizer & Filter Unit Tests', () => {
  const sampleRawItems: RawM3uItem[] = [
    {
      id: 'bbc-one',
      name: 'BBC One (1080p)',
      logo: 'https://example.com/bbc1.png',
      groupTitle: 'News;General',
      country: 'UK',
      language: 'English',
      streamUrl: 'https://stream.example.com/bbc1.m3u8',
    },
    {
      id: 'bbc-one', // Duplicate channel entry with alternate stream URL
      name: 'BBC One',
      logo: 'https://example.com/bbc1.png',
      groupTitle: 'News',
      country: 'UK',
      language: 'English',
      streamUrl: 'https://stream2.example.com/bbc1_backup.m3u8',
    },
    {
      id: 'cnn-us',
      name: 'CNN International',
      logo: 'https://example.com/cnn.png',
      groupTitle: 'News',
      country: 'US',
      language: 'English',
      streamUrl: 'https://stream.example.com/cnn.m3u8',
    },
    {
      name: 'Euronews France',
      groupTitle: 'News',
      country: 'FR',
      language: 'French',
      streamUrl: 'https://stream.example.com/euronews_fr.m3u8',
    },
  ];

  test('normalizes raw items into clean Channel objects with stable IDs', () => {
    const channel = ChannelNormalizer.normalizeRawItem(sampleRawItems[0]);
    expect(channel).not.toBeNull();
    expect(channel?.id).toBe('tvg_bbc-one');
    expect(channel?.name).toBe('BBC One (1080p)');
    expect(channel?.normalizedName).toBe('bbc one (1080p)');
    expect(channel?.streamType).toBe('hls');
    expect(channel?.categories).toEqual(['News', 'General']);
  });

  test('deduplicates catalogue entries and merges alternate stream URLs', () => {
    const catalogue = ChannelNormalizer.normalizeCatalogue(sampleRawItems);
    expect(catalogue.length).toBe(3); // BBC One merged into 1 entry with alternate stream

    const bbc = catalogue.find((c) => c.id === 'tvg_bbc-one');
    expect(bbc).toBeDefined();
    expect(bbc?.streamUrl).toBe('https://stream.example.com/bbc1.m3u8');
    expect(bbc?.alternateStreamUrls).toContain('https://stream2.example.com/bbc1_backup.m3u8');
  });

  test('filters channels by search query, country, and category', () => {
    const catalogue = ChannelNormalizer.normalizeCatalogue(sampleRawItems);

    const newsChannels = ChannelNormalizer.filterChannels(catalogue, { category: 'News' });
    expect(newsChannels.length).toBe(3);

    const ukChannels = ChannelNormalizer.filterChannels(catalogue, { country: 'UK' });
    expect(ukChannels.length).toBe(1);
    expect(ukChannels[0].name).toContain('BBC One');

    const searchCnn = ChannelNormalizer.filterChannels(catalogue, { searchQuery: 'cnn' });
    expect(searchCnn.length).toBe(1);
    expect(searchCnn[0].id).toBe('tvg_cnn-us');
  });

  test('filters channels by local favorites', () => {
    const catalogue = ChannelNormalizer.normalizeCatalogue(sampleRawItems);
    const favoriteIds = ['tvg_bbc-one'];

    const favoritesOnly = ChannelNormalizer.filterChannels(catalogue, {
      favoritesOnly: true,
      favoriteIds,
    });

    expect(favoritesOnly.length).toBe(1);
    expect(favoritesOnly[0].id).toBe('tvg_bbc-one');
  });
});
