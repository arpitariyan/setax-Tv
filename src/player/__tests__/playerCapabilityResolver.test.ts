import { PlayerCapabilityResolver } from '../playerCapabilityResolver';

describe('Player Capability Resolver Unit Tests', () => {
  test('detects live HLS stream capabilities without faking seek or audio tracks', () => {
    const hlsUrl = 'https://stream.example.com/live/bbc/index.m3u8';
    const caps = PlayerCapabilityResolver.resolveCapabilities(hlsUrl);

    expect(caps.live).toBe(true);
    expect(caps.seekable).toBe(false); // Live streams are non-seekable by default
    expect(caps.pictureInPicture).toBe(true);
  });

  test('detects mp4 file capabilities as seekable VOD', () => {
    const mp4Url = 'https://example.com/videos/sample.mp4';
    const caps = PlayerCapabilityResolver.resolveCapabilities(mp4Url);

    expect(caps.live).toBe(false);
    expect(caps.seekable).toBe(true);
  });
});
