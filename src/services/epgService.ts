import { readEpgCache, saveEpgCache } from '@/storage';
import { EpgProgram } from '@/types/epg';

export interface CurrentAndNextProgram {
  current: EpgProgram | null;
  next: EpgProgram | null;
  currentFormattedTime?: string;
  nextFormattedTime?: string;
  fallbackText: string;
}

export const FALLBACK_EPG_TEXT = 'Program information unavailable.';

export class EpgService {
  private static memoryEpgMap: Record<string, EpgProgram[]> = {};

  static async loadEpg(forceRefresh = false): Promise<Record<string, EpgProgram[]>> {
    if (!forceRefresh) {
      if (Object.keys(EpgService.memoryEpgMap).length > 0) {
        return EpgService.memoryEpgMap;
      }
      const cached = await readEpgCache();
      if (cached && cached.programsByChannel) {
        EpgService.memoryEpgMap = cached.programsByChannel;
        return cached.programsByChannel;
      }
    }
    return EpgService.memoryEpgMap;
  }

  static setEpgData(programsByChannel: Record<string, EpgProgram[]>): void {
    EpgService.memoryEpgMap = programsByChannel;
    saveEpgCache(programsByChannel);
  }

  static formatTime(timestamp?: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static getProgramInfo(channelId: string, epgId?: string): CurrentAndNextProgram {
    const key = epgId || channelId;
    const programs = EpgService.memoryEpgMap[key] || EpgService.memoryEpgMap[channelId] || [];

    if (!programs || programs.length === 0) {
      return {
        current: null,
        next: null,
        fallbackText: FALLBACK_EPG_TEXT,
      };
    }

    const now = Date.now();
    const current = programs.find((p) => p.start <= now && p.stop > now) || null;
    const upcoming = programs.filter((p) => p.start >= now).sort((a, b) => a.start - b.start);
    const next = upcoming.length > 0 ? upcoming[0] : null;

    const currentFormattedTime = current
      ? `${EpgService.formatTime(current.start)} - ${EpgService.formatTime(current.stop)}`
      : undefined;

    const nextFormattedTime = next
      ? `${EpgService.formatTime(next.start)} - ${EpgService.formatTime(next.stop)}`
      : undefined;

    return {
      current,
      next,
      currentFormattedTime,
      nextFormattedTime,
      fallbackText: current ? current.title : FALLBACK_EPG_TEXT,
    };
  }
}
