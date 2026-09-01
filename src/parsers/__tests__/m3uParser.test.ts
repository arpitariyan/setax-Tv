import { parseM3u } from '../m3uParser';

describe('M3U Parser Unit Tests', () => {
  test('parses valid EXTINF header and stream URL', () => {
    const m3uSample = `
#EXTM3U
#EXTINF:-1 tvg-id="BBCNews.uk" tvg-name="BBC News" tvg-logo="https://example.com/bbc.png" group-title="News",BBC News HD
https://stream.example.com/bbc/index.m3u8
    `;

    const result = parseM3u(m3uSample);
    expect(result.items.length).toBe(1);

    const item = result.items[0];
    expect(item.name).toBe('BBC News HD');
    expect(item.tvgId).toBe('BBCNews.uk');
    expect(item.tvgName).toBe('BBC News');
    expect(item.tvgLogo).toBe('https://example.com/bbc.png');
    expect(item.groupTitle).toBe('News');
    expect(item.streamUrl).toBe('https://stream.example.com/bbc/index.m3u8');
  });

  test('tolerates malformed lines and empty lines without crashing', () => {
    const malformedSample = `
#EXTM3U
RANDOM CORRUPT LINE HERE
#EXTINF:-1 group-title="Sports"
https://stream.example.com/sports/index.m3u8

#EXTINF:-1 tvg-name="CNN"
https://stream.example.com/cnn/live
INVALID URL NO HTTP
    `;

    const result = parseM3u(malformedSample);
    expect(result.items.length).toBe(2);
    expect(result.diagnostics.parsedCount).toBe(2);
    expect(result.diagnostics.malformedLines).toBeGreaterThan(0);
  });

  test('extracts custom http headers from EXTVLCOPT directives', () => {
    const headerSample = `
#EXTM3U
#EXTINF:-1 tvg-id="Premium.us",Premium Channel
#EXTVLCOPT:http-user-agent=VLC/3.0.18
https://stream.example.com/premium.m3u8
    `;

    const result = parseM3u(headerSample);
    expect(result.items.length).toBe(1);
    expect(result.items[0].httpHeaders).toBeDefined();
    expect(result.items[0].httpHeaders?.['http-user-agent']).toBe('VLC/3.0.18');
  });

  test('handles URL without EXTINF gracefully', () => {
    const rawUrlSample = `
#EXTM3U
https://stream.example.com/rawchannel.m3u8
    `;

    const result = parseM3u(rawUrlSample);
    expect(result.items.length).toBe(1);
    expect(result.items[0].streamUrl).toBe('https://stream.example.com/rawchannel.m3u8');
    expect(result.items[0].name).toBe('rawchannel.m3u8');
  });
});
