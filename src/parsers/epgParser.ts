import { EpgProgram } from '@/types/epg';

/**
 * Parses XMLTV program dates into Unix timestamp ms.
 * Example XMLTV time string: "20260901120000 +0000" or "20260901120000"
 */
export function parseXmltvDate(dateStr: string): number {
  if (!dateStr) return Date.now();
  const cleaned = dateStr.trim();
  const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return Date.now();

  const [, year, month, day, hour, min, sec] = match;
  const isoStr = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
  const timestamp = Date.parse(isoStr);

  return isNaN(timestamp) ? Date.now() : timestamp;
}

/**
 * Robust EPG Parser that parses XMLTV guide data or JSON EPG feeds into normalized EpgPrograms.
 */
export function parseEpgData(xmlOrJsonContent: string): Record<string, EpgProgram[]> {
  const result: Record<string, EpgProgram[]> = {};

  if (!xmlOrJsonContent || !xmlOrJsonContent.trim()) {
    return result;
  }

  const content = xmlOrJsonContent.trim();

  // If content is JSON format
  if (content.startsWith('{') || content.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.keys(parsed).forEach((channelId) => {
          if (Array.isArray(parsed[channelId])) {
            result[channelId] = parsed[channelId];
          }
        });
      }
      return result;
    } catch {
      // Fall through to XML parsing
    }
  }

  // Basic regex-based XMLTV Programme Parser
  const programmeRegex = /<programme\s+[^>]*channel=["']([^"']+)["'][^>]*start=["']([^"']+)["'][^>]*stop=["']([^"']+)["'][^>]*>([\s\S]*?)<\/programme>/gi;
  let match: RegExpExecArray | null;

  while ((match = programmeRegex.exec(content)) !== null) {
    const channelId = match[1];
    const startRaw = match[2];
    const stopRaw = match[3];
    const body = match[4];

    const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = body.match(/<desc[^>]*>([\s\S]*?)<\/desc>/i);
    const categoryMatch = body.match(/<category[^>]*>([\s\S]*?)<\/category>/i);

    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim() : 'Scheduled Program';
    const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim() : undefined;
    const category = categoryMatch ? categoryMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim() : undefined;

    const start = parseXmltvDate(startRaw);
    const stop = parseXmltvDate(stopRaw);

    const program: EpgProgram = {
      id: `${channelId}_${start}_${stop}`,
      channelId,
      title,
      description,
      start,
      stop,
      category,
    };

    if (!result[channelId]) {
      result[channelId] = [];
    }
    result[channelId].push(program);
  }

  return result;
}
