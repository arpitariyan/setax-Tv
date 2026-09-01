import { create } from 'zustand';
import { Channel, StreamCapabilities } from '@/types/channel';
import { PlayerState } from './playerTypes';
import { PlayerCapabilityResolver } from './playerCapabilityResolver';

export interface PlayerStoreState {
  playerState: PlayerState;
  activeChannel: Channel | null;
  activeStreamUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  capabilities: StreamCapabilities;
  isPlaying: boolean;
  isMuted: boolean;
  controlsVisible: boolean;

  // Actions
  setActiveChannel: (channel: Channel | null, customStreamUrl?: string) => void;
  setPlayerState: (state: PlayerState, error?: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setControlsVisible: (visible: boolean) => void;
  incrementRetry: () => boolean; // Returns true if retry under limit
  resetPlayerState: () => void;
}

const DEFAULT_CAPABILITIES: StreamCapabilities = {
  live: true,
  seekable: false,
  qualitySelection: false,
  audioTracks: false,
  subtitles: false,
  pictureInPicture: true,
};

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  playerState: 'IDLE',
  activeChannel: null,
  activeStreamUrl: null,
  errorMessage: null,
  retryCount: 0,
  maxRetries: 3,
  capabilities: DEFAULT_CAPABILITIES,
  isPlaying: true,
  isMuted: false,
  controlsVisible: true,

  setActiveChannel: (channel, customStreamUrl) => {
    const url = customStreamUrl || channel?.streamUrl || null;
    const caps = url ? PlayerCapabilityResolver.resolveCapabilities(url) : DEFAULT_CAPABILITIES;
    set({
      activeChannel: channel,
      activeStreamUrl: url,
      playerState: 'CONNECTING',
      errorMessage: null,
      retryCount: 0,
      capabilities: caps,
      controlsVisible: true,
    });
  },

  setPlayerState: (state, error) => {
    set({
      playerState: state,
      errorMessage: error || null,
      isPlaying: state === 'PLAYING',
    });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setControlsVisible: (visible) => set({ controlsVisible: visible }),

  incrementRetry: () => {
    const { retryCount, maxRetries } = get();
    if (retryCount < maxRetries) {
      set({
        retryCount: retryCount + 1,
        playerState: 'RECONNECTING',
        errorMessage: null,
      });
      return true;
    }
    set({
      playerState: 'ERROR',
      errorMessage: 'Playback failed after maximum retries. Stream may be offline.',
    });
    return false;
  },

  resetPlayerState: () => {
    set({
      playerState: 'IDLE',
      activeChannel: null,
      activeStreamUrl: null,
      errorMessage: null,
      retryCount: 0,
      isPlaying: false,
      controlsVisible: true,
    });
  },
}));
