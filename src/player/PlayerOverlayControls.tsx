import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppBadge } from '@/components/ui';
import { IconSizes, Spacing } from '@/theme/tokens';
import { Channel, StreamCapabilities } from '@/types/channel';
import { PlayerState } from './playerTypes';

export interface PlayerOverlayControlsProps {
  visible: boolean;
  channel?: Channel;
  title: string;
  isPlaying: boolean;
  isMuted: boolean;
  isFavorite: boolean;
  playerState: PlayerState;
  capabilities: StreamCapabilities;
  sleepTimerMinutes: number | null;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFavorite: () => void;
  onSeekBackward?: () => void;
  onSeekForward?: () => void;
  onGoLive?: () => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  onOpenDrawer?: () => void;
  onLock: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
  onUserInteraction: () => void;
}

export const PlayerOverlayControls: React.FC<PlayerOverlayControlsProps> = ({
  visible,
  channel,
  title,
  isPlaying,
  isMuted,
  isFavorite,
  playerState,
  capabilities,
  sleepTimerMinutes,
  onTogglePlay,
  onToggleMute,
  onToggleFavorite,
  onSeekBackward,
  onSeekForward,
  onGoLive,
  onPrevChannel,
  onNextChannel,
  onOpenDrawer,
  onLock,
  onOpenSettings,
  onClose,
  onUserInteraction,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible && (fadeAnim as any)._value === 0) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
      ]}>
      {/* Top Header Controls */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => {
            onUserInteraction();
            onClose();
          }}
          style={styles.iconBtn}
          accessibilityLabel="Back">
          <Ionicons name="arrow-back-sharp" size={IconSizes.md} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.channelMeta}>
          <AppText variant="titleSmall" numberOfLines={1}>
            {channel?.name || title}
          </AppText>
          {channel?.country ? (
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {channel.country} {channel.categories[0] ? `• ${channel.categories[0]}` : ''}
            </AppText>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          {onOpenDrawer ? (
            <Pressable
              onPress={() => {
                onUserInteraction();
                onOpenDrawer();
              }}
              style={styles.iconBtn}
              accessibilityLabel="Channel Drawer">
              <Ionicons name="list-sharp" size={IconSizes.md} color={colors.textPrimary} />
            </Pressable>
          ) : null}

          {sleepTimerMinutes !== null && sleepTimerMinutes > 0 ? (
            <AppBadge label={`SLEEP: ${sleepTimerMinutes}M`} status="info" />
          ) : null}

          <Pressable
            onPress={() => {
              onUserInteraction();
              onToggleFavorite();
            }}
            style={styles.iconBtn}
            accessibilityLabel="Favorite">
            <Ionicons
              name={isFavorite ? 'heart-sharp' : 'heart-outline'}
              size={IconSizes.md}
              color={isFavorite ? '#EF4444' : colors.textPrimary}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              onUserInteraction();
              onOpenSettings();
            }}
            style={styles.iconBtn}
            accessibilityLabel="Player Settings">
            <Ionicons name="settings-sharp" size={IconSizes.md} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            onPress={() => {
              onUserInteraction();
              onLock();
            }}
            style={styles.iconBtn}
            accessibilityLabel="Lock Controls">
            <Ionicons name="lock-closed-outline" size={IconSizes.md} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Center Controls Row with Prev Channel, Seek -10s, Play/Pause, Seek +10s, Next Channel */}
      <View style={styles.centerControl}>
        {onPrevChannel ? (
          <Pressable
            onPress={() => {
              onUserInteraction();
              onPrevChannel();
            }}
            style={styles.navChannelBtn}
            accessibilityLabel="Previous Channel">
            <Ionicons name="play-skip-back-sharp" size={28} color={colors.textPrimary} />
          </Pressable>
        ) : null}

        {capabilities.seekable && onSeekBackward ? (
          <Pressable
            onPress={() => {
              onUserInteraction();
              onSeekBackward();
            }}
            style={styles.seekBtn}
            accessibilityLabel="Rewind 10 seconds">
            <Ionicons name="refresh-circle-sharp" size={36} color={colors.textPrimary} />
            <AppText variant="caption" color="primary">-10s</AppText>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            onUserInteraction();
            onTogglePlay();
          }}
          style={styles.playBtn}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
          <Ionicons
            name={isPlaying ? 'pause-sharp' : 'play-sharp'}
            size={IconSizes.xl}
            color={colors.textPrimary}
          />
        </Pressable>

        {capabilities.seekable && onSeekForward ? (
          <Pressable
            onPress={() => {
              onUserInteraction();
              onSeekForward();
            }}
            style={styles.seekBtn}
            accessibilityLabel="Forward 10 seconds">
            <Ionicons name="reload-circle-sharp" size={36} color={colors.textPrimary} />
            <AppText variant="caption" color="primary">+10s</AppText>
          </Pressable>
        ) : null}

        {onNextChannel ? (
          <Pressable
            onPress={() => {
              onUserInteraction();
              onNextChannel();
            }}
            style={styles.navChannelBtn}
            accessibilityLabel="Next Channel">
            <Ionicons name="play-skip-forward-sharp" size={28} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      {/* Bottom Bar Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <AppBadge
            label={playerState === 'PLAYING' ? 'LIVE' : playerState}
            status={playerState === 'PLAYING' ? 'available' : 'info'}
          />

          {capabilities.seekable && onGoLive ? (
            <Pressable
              onPress={() => {
                onUserInteraction();
                onGoLive();
              }}
              style={styles.goLiveBtn}>
              <AppText variant="badge" style={{ color: '#10B981' }}>GO LIVE</AppText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.bottomRight}>
          <Pressable
            onPress={() => {
              onUserInteraction();
              onToggleMute();
            }}
            style={styles.iconBtn}
            accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}>
            <Ionicons
              name={isMuted ? 'volume-mute-sharp' : 'volume-high-sharp'}
              size={IconSizes.md}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: Spacing.lg,
    zIndex: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  channelMeta: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  navChannelBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  seekBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  goLiveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  bottomRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
