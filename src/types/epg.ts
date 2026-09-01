export interface EpgProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  start: number; // Unix timestamp in ms
  stop: number;  // Unix timestamp in ms
  category?: string;
}

export interface EpgCacheEnvelope {
  schemaVersion: number;
  fetchedAt: number;
  programsByChannel: Record<string, EpgProgram[]>;
}
