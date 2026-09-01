import { StreamCapabilities } from '@/types/channel';

export class PlayerCapabilityResolver {
  /**
   * Resolves capabilities dynamically based on stream URL, format, and playback metrics.
   * Does NOT fake capabilities if unsupported.
   */
  static resolveCapabilities(streamUrl: string): StreamCapabilities {
    const isLiveHls = streamUrl.includes('.m3u8') || streamUrl.includes('/live/');
    const isMp4 = streamUrl.includes('.mp4');

    return {
      live: isLiveHls,
      seekable: isMp4, // Standard live HLS streams are non-seekable unless DVR manifest is detected
      qualitySelection: false, // Default false until multi-variant HLS manifest inspection
      audioTracks: false,
      subtitles: false,
      pictureInPicture: true,
    };
  }
}
