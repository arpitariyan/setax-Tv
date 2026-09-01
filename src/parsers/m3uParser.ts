import { M3uParseResult, RawM3uItem } from '@/types/channel';

/**
 * Robust M3U / M3U8 Playlist Parser
 * Dedicated parser isolated from UI components.
 * Tolerates malformed metadata, missing attributes, and duplicate URLs.
 */
export function parseM3u(m3uContent: string): M3uParseResult {
  const startTime = Date.now();
  const lines = m3uContent.split(/\r?\n/);

  const items: RawM3uItem[] = [];
  let currentExtInf: string | null = null;
  let currentHttpHeaders: Record<string, string> | undefined = undefined;

  let parsedCount = 0;
  let skippedLines = 0;
  let malformedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      skippedLines++;
      continue;
    }

    if (line.startsWith('#EXTM3U')) {
      // Header line
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      currentExtInf = line;
      continue;
    }

    if (line.startsWith('#EXTVLCOPT:') || line.startsWith('#EXTHTTP:')) {
      // Custom stream headers (e.g. #EXTVLCOPT:http-user-agent=...)
      try {
        if (!currentHttpHeaders) currentHttpHeaders = {};
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const optStr = line.substring(colonIdx + 1);
          const eqIdx = optStr.indexOf('=');
          if (eqIdx !== -1) {
            const key = optStr.substring(0, eqIdx).trim();
            const val = optStr.substring(eqIdx + 1).trim();
            currentHttpHeaders[key] = val;
          }
        }
      } catch {
        // Ignore header parse error
      }
      continue;
    }

    if (line.startsWith('#')) {
      // Other directive comment
      continue;
    }

    // Line is a stream URL candidate
    if (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('rtmp://')) {
      const parsedItem = parseItemFromExtInf(currentExtInf, line, currentHttpHeaders);
      if (parsedItem) {
        items.push(parsedItem);
        parsedCount++;
      } else {
        malformedLines++;
      }
      // Reset state for next stream entry
      currentExtInf = null;
      currentHttpHeaders = undefined;
    } else {
      malformedLines++;
    }
  }

  const duration = Date.now() - startTime;

  return {
    items,
    diagnostics: {
      totalLines: lines.length,
      parsedCount,
      skippedLines,
      malformedLines,
      parseDurationMs: duration,
    },
  };
}

function parseItemFromExtInf(
  extInfLine: string | null,
  streamUrl: string,
  httpHeaders?: Record<string, string>
): RawM3uItem | null {
  if (!streamUrl) return null;

  if (!extInfLine) {
    // Fallback if URL exists without preceding #EXTINF
    const urlParts = streamUrl.split('/');
    const fallbackName = urlParts[urlParts.length - 1] || streamUrl;
    return {
      name: fallbackName,
      streamUrl,
      httpHeaders,
    };
  }

  // Parse attributes from EXTINF line
  // Example: #EXTINF:-1 tvg-id="BBC.uk" tvg-name="BBC" tvg-logo="https://..." group-title="News",BBC News
  const tvgId = extractAttribute(extInfLine, 'tvg-id');
  const tvgName = extractAttribute(extInfLine, 'tvg-name');
  const tvgLogo = extractAttribute(extInfLine, 'tvg-logo') || extractAttribute(extInfLine, 'logo');
  const groupTitle = extractAttribute(extInfLine, 'group-title');
  const country = extractAttribute(extInfLine, 'tvg-country');
  const language = extractAttribute(extInfLine, 'tvg-language');
  const category = extractAttribute(extInfLine, 'category');

  // Extract channel display name (text after comma)
  let channelName = '';
  const commaIdx = extInfLine.lastIndexOf(',');
  if (commaIdx !== -1) {
    channelName = extInfLine.substring(commaIdx + 1).trim();
  }

  if (!channelName) {
    channelName = tvgName || tvgId || streamUrl;
  }

  return {
    id: tvgId || undefined,
    name: channelName,
    logo: tvgLogo || undefined,
    groupTitle: groupTitle || undefined,
    tvgId: tvgId || undefined,
    tvgName: tvgName || undefined,
    tvgLogo: tvgLogo || undefined,
    country: country || undefined,
    language: language || undefined,
    category: category || undefined,
    streamUrl: streamUrl.trim(),
    httpHeaders,
    rawExtInf: extInfLine,
  };
}

function extractAttribute(line: string, attrName: string): string | null {
  // Regex to match attr="val" or attr=val
  const pattern = new RegExp(`${attrName}=["']([^"']+)["']|${attrName}=([^\\s,]+)`, 'i');
  const match = line.match(pattern);
  if (match) {
    return match[1] || match[2] || null;
  }
  return null;
}
