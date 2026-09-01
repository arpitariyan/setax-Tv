import { Channel } from '@/types/channel';

export interface RecoveryResult {
  nextStreamUrl: string;
  streamIndex: number;
  hasFallback: boolean;
}

export class PlayerRecovery {
  private static fallbackAttemptMap = new Map<string, number>();

  /**
   * Resolves the next candidate stream URL when a channel fails to play.
   */
  static getNextFallbackStream(channel: Channel): RecoveryResult | null {
    const attempts = PlayerRecovery.fallbackAttemptMap.get(channel.id) || 0;
    const alternates = channel.alternateStreamUrls || [];

    if (attempts < alternates.length) {
      const nextStreamUrl = alternates[attempts];
      PlayerRecovery.fallbackAttemptMap.set(channel.id, attempts + 1);
      return {
        nextStreamUrl,
        streamIndex: attempts + 1,
        hasFallback: true,
      };
    }

    return null; // No more fallbacks available
  }

  static resetFallbackAttempts(channelId: string): void {
    PlayerRecovery.fallbackAttemptMap.delete(channelId);
  }
}
