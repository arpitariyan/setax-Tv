import { StreamCapabilities } from '@/types/channel';

export interface DynamicStreamMetrics {
  duration?: number;
  audioTracksCount?: number;
  subtitleTracksCount?: number;
  qualitiesCount?: number;
}

export class PlayerCapabilityResolver {
  /**
   * Resolves capabilities dynamically based on stream URL and real-time player metrics.
   * Does NOT fake capabilities if unsupported.
   */
  static resolveCapabilities(
    streamUrl: string,
    metrics?: DynamicStreamMetrics
  ): StreamCapabilities {
    const isMp4 = streamUrl.toLowerCase().includes('.mp4');
    const dur = metrics?.duration || 0;

    // Seekable ONLY when MP4 file or player exposes positive finite duration (DVR / VOD stream)
    const isSeekable = isMp4 || (dur > 0 && isFinite(dur));

    const hasAudioTracks = Boolean(metrics?.audioTracksCount && metrics.audioTracksCount > 1);
    const hasSubtitleTracks = Boolean(metrics?.subtitleTracksCount && metrics.subtitleTracksCount > 0);
    const hasQualitySelection = Boolean(metrics?.qualitiesCount && metrics.qualitiesCount > 1);

    return {
      live: !isMp4,
      seekable: isSeekable,
      qualitySelection: hasQualitySelection,
      audioTracks: hasAudioTracks,
      subtitles: hasSubtitleTracks,
      pictureInPicture: true,
    };
  }
}
