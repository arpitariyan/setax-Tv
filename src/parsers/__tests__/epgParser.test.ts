import '@/storage/__tests__/setupMocks';
import { parseEpgData, parseXmltvDate } from '../epgParser';
import { EpgService, FALLBACK_EPG_TEXT } from '@/services/epgService';

describe('EPG Parser & Service Unit Tests', () => {
  test('parses XMLTV date strings into Unix timestamps', () => {
    const ts = parseXmltvDate('20260901120000 +0000');
    expect(ts).toBe(Date.parse('2026-09-01T12:00:00Z'));
  });

  test('parses XMLTV program entries correctly', () => {
    const xmltvSample = `
<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <programme channel="BBCNews.uk" start="20260901100000" stop="20260901110000">
    <title>BBC News at Ten</title>
    <desc>Latest national news coverage.</desc>
    <category>News</category>
  </programme>
</tv>
    `;

    const result = parseEpgData(xmltvSample);
    expect(result['BBCNews.uk']).toBeDefined();
    expect(result['BBCNews.uk'].length).toBe(1);

    const prog = result['BBCNews.uk'][0];
    expect(prog.title).toBe('BBC News at Ten');
    expect(prog.description).toBe('Latest national news coverage.');
    expect(prog.category).toBe('News');
  });

  test('returns clean fallback text when EPG is unavailable for channel', () => {
    EpgService.setEpgData({});
    const info = EpgService.getProgramInfo('unknown-ch');
    expect(info.current).toBeNull();
    expect(info.next).toBeNull();
    expect(info.fallbackText).toBe(FALLBACK_EPG_TEXT);
  });
});
