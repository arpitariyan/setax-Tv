import { StreamCapabilities } from '@/types/channel';

export type PlayerState =
  | 'IDLE'
  | 'CONNECTING'
  | 'BUFFERING'
  | 'PLAYING'
  | 'PAUSED'
  | 'SEEKING'
  | 'LIVE_EDGE'
  | 'RECONNECTING'
  | 'ERROR'
  | 'OFFLINE';

export interface PlayerStatusInfo {
  state: PlayerState;
  errorMessage?: string;
  retryCount: number;
  capabilities: StreamCapabilities;
}
