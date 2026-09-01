import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PlayerState } from './playerTypes';

export interface VideoSurfaceRef {
  togglePlay: () => void;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
}

export interface VideoSurfaceProps {
  streamUrl: string;
  onStateChange?: (state: PlayerState, error?: string) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onMuteChange?: (isMuted: boolean) => void;
}

export const VideoSurface = forwardRef<VideoSurfaceRef, VideoSurfaceProps>(({
  streamUrl,
  onStateChange,
  onPlayingChange,
  onMuteChange,
}, ref) => {
  const player = useVideoPlayer(streamUrl, (p) => {
    p.play();
  });

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
  }), [player, onMuteChange]);

  useEffect(() => {
    if (!player) return;

    onStateChange?.('CONNECTING');

    const statusSub = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay') {
        onStateChange?.('PLAYING');
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
  }, [player, onStateChange, onPlayingChange, onMuteChange]);

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
