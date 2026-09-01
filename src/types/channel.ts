export interface StreamCapabilities {
  live: boolean;
  seekable: boolean;
  qualitySelection: boolean;
  audioTracks: boolean;
  subtitles: boolean;
  pictureInPicture: boolean;
}

export type ChannelStatus = 'available' | 'unstable' | 'unavailable' | 'unknown';
export type StreamType = 'hls' | 'dash' | 'm3u8' | 'mp4' | 'unknown';

export interface Channel {
  id: string;
  name: string;
  normalizedName: string;
  logo?: string;
  country?: string;
  countryCode?: string;
  languages: string[];
  categories: string[];
  streamUrl: string;
  alternateStreamUrls?: string[];
  streamType: StreamType;
  epgId?: string;
  source: string;
  status: ChannelStatus;
  lastChecked: number | null;
  metadataVersion: number;
  capabilities: StreamCapabilities;
}

export interface RawM3uItem {
  id?: string;
  name: string;
  logo?: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  country?: string;
  language?: string;
  category?: string;
  streamUrl: string;
  httpHeaders?: Record<string, string>;
  rawExtInf?: string;
}

export interface M3uParseDiagnostics {
  totalLines: number;
  parsedCount: number;
  skippedLines: number;
  malformedLines: number;
  parseDurationMs: number;
}

export interface M3uParseResult {
  items: RawM3uItem[];
  diagnostics: M3uParseDiagnostics;
}

export interface ChannelFilterOptions {
  searchQuery?: string;
  country?: string | null;
  language?: string | null;
  category?: string | null;
  status?: ChannelStatus | 'all';
  favoritesOnly?: boolean;
  favoriteIds?: string[];
}
