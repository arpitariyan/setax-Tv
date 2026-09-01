import { PlayerRecovery } from '../playerRecovery';
import { Channel } from '@/types/channel';

describe('PlayerRecovery Unit Tests', () => {
  const mockChannel: Channel = {
    id: 'ch-bbc',
    name: 'BBC News',
    normalizedName: 'bbc news',
    streamUrl: 'https://stream1.example.com/live.m3u8',
    alternateStreamUrls: [
      'https://stream2.example.com/live_backup.m3u8',
      'https://stream3.example.com/live_fallback.m3u8',
    ],
    streamType: 'hls',
    source: 'iptv-org',
    status: 'available',
    lastChecked: null,
    metadataVersion: 1,
    languages: ['English'],
    categories: ['News'],
    capabilities: {
      live: true,
      seekable: false,
      qualitySelection: false,
      audioTracks: false,
      subtitles: false,
      pictureInPicture: true,
    },
  };

  beforeEach(() => {
    PlayerRecovery.resetFallbackAttempts(mockChannel.id);
  });

  test('returns alternate stream URLs sequentially on failure', () => {
    const fallback1 = PlayerRecovery.getNextFallbackStream(mockChannel);
    expect(fallback1).not.toBeNull();
    expect(fallback1?.nextStreamUrl).toBe('https://stream2.example.com/live_backup.m3u8');
    expect(fallback1?.streamIndex).toBe(1);

    const fallback2 = PlayerRecovery.getNextFallbackStream(mockChannel);
    expect(fallback2).not.toBeNull();
    expect(fallback2?.nextStreamUrl).toBe('https://stream3.example.com/live_fallback.m3u8');
    expect(fallback2?.streamIndex).toBe(2);

    // No more alternate streams available
    const fallback3 = PlayerRecovery.getNextFallbackStream(mockChannel);
    expect(fallback3).toBeNull();
  });

  test('resetFallbackAttempts clears fallback counter', () => {
    PlayerRecovery.getNextFallbackStream(mockChannel);
    PlayerRecovery.resetFallbackAttempts(mockChannel.id);

    const fallback1 = PlayerRecovery.getNextFallbackStream(mockChannel);
    expect(fallback1?.streamIndex).toBe(1);
  });
});
