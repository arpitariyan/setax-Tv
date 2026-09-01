import { usePlayerStore } from '../usePlayerStore';

describe('usePlayerStore Unit Tests', () => {
  beforeEach(() => {
    usePlayerStore.getState().resetPlayerState();
  });

  test('initializes with IDLE state', () => {
    const state = usePlayerStore.getState();
    expect(state.playerState).toBe('IDLE');
    expect(state.activeChannel).toBeNull();
    expect(state.retryCount).toBe(0);
  });

  test('setActiveChannel transitions state to CONNECTING and resolves capabilities', () => {
    const mockChannel = {
      id: 'ch-1',
      name: 'BBC News',
      normalizedName: 'bbc news',
      streamUrl: 'https://stream.example.com/bbc.m3u8',
      streamType: 'hls' as const,
      source: 'iptv-org',
      status: 'available' as const,
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

    usePlayerStore.getState().setActiveChannel(mockChannel);
    const state = usePlayerStore.getState();

    expect(state.playerState).toBe('CONNECTING');
    expect(state.activeChannel?.id).toBe('ch-1');
    expect(state.capabilities.live).toBe(true);
  });

  test('incrementRetry enforces bounded retries up to maxRetries', () => {
    const store = usePlayerStore.getState();
    expect(store.incrementRetry()).toBe(true); // retry 1
    expect(usePlayerStore.getState().retryCount).toBe(1);

    expect(store.incrementRetry()).toBe(true); // retry 2
    expect(store.incrementRetry()).toBe(true); // retry 3

    // 4th retry exceeds maxRetries (3)
    expect(usePlayerStore.getState().incrementRetry()).toBe(false);
    expect(usePlayerStore.getState().playerState).toBe('ERROR');
  });
});
