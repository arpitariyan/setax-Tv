import React, { useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PlayerState } from './playerTypes';
import { StreamCapabilities } from '@/types/channel';

export interface TrackItem {
  id: string;
  label: string;
  language?: string;
}

export interface VideoSurfaceRef {
  togglePlay: () => void;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  seekBy: (seconds: number) => void;
  seekToLive: () => void;
  setAudioTrack?: (trackId: string) => void;
  setSubtitleTrack?: (trackId: string | null) => void;
  setVideoQuality?: (qualityId: string) => void;
}

export interface VideoSurfaceProps {
  streamUrl: string;
  onStateChange?: (state: PlayerState, error?: string) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onMuteChange?: (isMuted: boolean) => void;
  onCapabilitiesResolved?: (
    capabilities: StreamCapabilities,
    audioTracks: TrackItem[],
    subtitleTracks: TrackItem[],
    qualities: string[]
  ) => void;
}

export const VideoSurface = forwardRef<VideoSurfaceRef, VideoSurfaceProps>(({
  streamUrl,
  onStateChange,
  onPlayingChange,
  onMuteChange,
  onCapabilitiesResolved,
}, ref) => {
  const player = useVideoPlayer(streamUrl, (p) => {
    p.play();
  });

  const seekBy = useCallback((seconds: number) => {
    if (!player) return;
    try {
      if (typeof (player as any).seekBy === 'function') {
        (player as any).seekBy(seconds);
      } else {
        const target = Math.max(0, (player.currentTime || 0) + seconds);
        player.currentTime = target;
      }
    } catch (e) {
      console.warn('[VideoSurface] seekBy failed', e);
    }
  }, [player]);

  const seekToLive = useCallback(() => {
    if (!player) return;
    try {
      if (player.duration && player.duration > 0 && isFinite(player.duration)) {
        player.currentTime = player.duration;
      }
    } catch (e) {
      console.warn('[VideoSurface] seekToLive failed', e);
    }
  }, [player]);

  useImperativeHandle(ref, () => ({
    togglePlay: () => {
      if (!player) return;
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    },
    toggleMute: () => {
      if (!player) return;
      player.muted = !player.muted;
      onMuteChange?.(player.muted);
    },
    play: () => player?.play(),
    pause: () => player?.pause(),
    seekBy,
    seekToLive,
    setAudioTrack: (trackId: string) => {
      if (!player) return;
      try {
        const tracks = (player as any).availableAudioTracks || [];
        const match = tracks.find((t: any) => t.id === trackId || t.language === trackId);
        if (match) (player as any).audioTrack = match;
      } catch (e) {
        console.warn('[VideoSurface] setAudioTrack error', e);
      }
    },
    setSubtitleTrack: (trackId: string | null) => {
      if (!player) return;
      try {
        if (!trackId) {
          (player as any).subtitleTrack = null;
          return;
        }
        const tracks = (player as any).availableSubtitleTracks || [];
        const match = tracks.find((t: any) => t.id === trackId || t.language === trackId);
        if (match) (player as any).subtitleTrack = match;
      } catch (e) {
        console.warn('[VideoSurface] setSubtitleTrack error', e);
      }
    },
    setVideoQuality: (qualityId: string) => {
      if (!player) return;
      try {
        if ((player as any).setVideoQuality) {
          (player as any).setVideoQuality(qualityId);
        }
      } catch (e) {
        console.warn('[VideoSurface] setVideoQuality error', e);
      }
    },
  }), [player, onMuteChange, seekBy, seekToLive]);

  useEffect(() => {
    if (!player) return;

    onStateChange?.('CONNECTING');

    const statusSub = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay') {
        onStateChange?.('PLAYING');

        // Dynamically inspect source capabilities
        const dur = player.duration || 0;
        const isMp4 = streamUrl.toLowerCase().includes('.mp4');
        const isSeekable = isMp4 || (dur > 0 && isFinite(dur));

        const rawAudioTracks = (player as any).availableAudioTracks || [];
        const rawSubtitleTracks = (player as any).availableSubtitleTracks || [];
        const rawQualities = (player as any).availableVideoQualities || [];

        const audioTracks: TrackItem[] = rawAudioTracks.map((t: any, idx: number) => ({
          id: t.id || t.language || `audio_${idx}`,
          label: t.label || t.language || `Track ${idx + 1}`,
          language: t.language,
        }));

        const subtitleTracks: TrackItem[] = rawSubtitleTracks.map((t: any, idx: number) => ({
          id: t.id || t.language || `sub_${idx}`,
          label: t.label || t.language || `Subtitles ${idx + 1}`,
          language: t.language,
        }));

        const qualities: string[] = rawQualities.map((q: any) => typeof q === 'string' ? q : q.label || `${q.height}p`);

        const capabilities: StreamCapabilities = {
          live: !isMp4,
          seekable: isSeekable,
          qualitySelection: qualities.length > 1,
          audioTracks: audioTracks.length > 1,
          subtitles: subtitleTracks.length > 0,
          pictureInPicture: true,
        };

        onCapabilitiesResolved?.(capabilities, audioTracks, subtitleTracks, qualities);
      } else if (event.status === 'error') {
        onStateChange?.('ERROR', event.error?.message || 'Stream playback failed');
      } else if (event.status === 'loading') {
        onStateChange?.('BUFFERING');
      }
    });

    const playingSub = player.addListener('playingChange', (event) => {
      onPlayingChange?.(event.isPlaying);
      if (event.isPlaying) {
        onStateChange?.('PLAYING');
      } else if (player.status === 'readyToPlay') {
        onStateChange?.('PAUSED');
      }
    });

    const muteSub = player.addListener('mutedChange', (event) => {
      onMuteChange?.(event.muted);
    });

    return () => {
      statusSub.remove();
      playingSub.remove();
      muteSub.remove();
    };
  }, [player, streamUrl, onStateChange, onPlayingChange, onMuteChange, onCapabilitiesResolved]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="contain"
      />
    </View>
  );
});

VideoSurface.displayName = 'VideoSurface';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
