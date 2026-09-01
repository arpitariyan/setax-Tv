import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppBadge, BadgeStatus } from '@/components/ui';
import { BorderRadius, IconSizes, Spacing } from '@/theme/tokens';
import { Channel } from '@/types/channel';

export interface ChannelCardProps {
  channel: Channel;
  isFavorite?: boolean;
  onToggleFavorite?: (channelId: string) => void;
  onPressChannel?: (channel: Channel) => void;
}

const ChannelCardComponent: React.FC<ChannelCardProps> = ({
  channel,
  isFavorite = false,
  onToggleFavorite,
  onPressChannel,
}) => {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  const getStatusBadge = (): { label: string; status: BadgeStatus } => {
    switch (channel.status) {
      case 'available':
        return { label: 'ONLINE', status: 'available' };
      case 'unstable':
        return { label: 'UNSTABLE', status: 'unstable' };
      case 'unavailable':
        return { label: 'OFFLINE', status: 'unavailable' };
      case 'unknown':
      default:
        return { label: 'UNVERIFIED', status: 'unknown' };
    }
  };

  const badgeInfo = getStatusBadge();

  return (
    <Pressable
      onPress={() => onPressChannel?.(channel)}
      accessibilityRole="button"
      accessibilityLabel={`Channel ${channel.name}, ${channel.countryCode || 'Global'}, status ${channel.status}`}
      accessibilityHint="Double tap to watch live channel stream"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceBase,
          borderColor: colors.borderDefault,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {/* Channel Logo Container with Error Fallback */}
      <View style={[styles.logoContainer, { backgroundColor: colors.surfaceRaised }]}>
        {channel.logo && !imageError ? (
          <Image
            source={{ uri: channel.logo }}
            style={styles.logo}
            contentFit="contain"
            transition={200}
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="tv-sharp" size={IconSizes.md} color={colors.textMuted} />
        )}
      </View>

      {/* Channel Details */}
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <AppText variant="titleSmall" numberOfLines={1} style={{ flex: 1 }}>
            {channel.name}
          </AppText>

          {onToggleFavorite ? (
            <Pressable
              onPress={() => onToggleFavorite(channel.id)}
              style={styles.favoriteBtn}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}>
              <Ionicons
                name={isFavorite ? 'heart-sharp' : 'heart-outline'}
                size={IconSizes.sm}
                color={isFavorite ? '#EF4444' : colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.badgeRow}>
          <AppBadge label={badgeInfo.label} status={badgeInfo.status} />

          {channel.countryCode ? (
            <AppBadge label={channel.countryCode} status="info" />
          ) : null}

          {channel.categories.length > 0 ? (
            <AppBadge label={channel.categories[0]} status="info" />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export const ChannelCard = React.memo(ChannelCardComponent);
ChannelCard.displayName = 'ChannelCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    minHeight: 76,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 48,
    height: 48,
  },
  details: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  favoriteBtn: {
    padding: Spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
});
