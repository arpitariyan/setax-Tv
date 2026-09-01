import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppCard, AppBadge, AppLoading, AppContainer } from '@/components/ui';
import { Spacing, IconSizes, BorderRadius } from '@/theme/tokens';
import { PlaylistService } from '@/services/playlistService';
import { ChannelNormalizer } from '@/services/channelNormalizer';
import { EpgService, FALLBACK_EPG_TEXT } from '@/services/epgService';
import { Channel } from '@/types/channel';

export default function GuideScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');

  useEffect(() => {
    async function initGuide() {
      try {
        setLoading(true);
        await EpgService.loadEpg();
        const res = await PlaylistService.loadPlaylist();
        const normalized = ChannelNormalizer.normalizeCatalogue(res.items);
        setChannels(normalized);
      } catch (err) {
        console.warn('[GuideScreen] Failed loading EPG guide dataset', err);
      } finally {
        setLoading(false);
      }
    }

    initGuide();
  }, []);

  const handleLaunchChannel = useCallback((channel: Channel) => {
    router.push({
      pathname: '/player/[id]',
      params: { id: channel.id, streamUrl: channel.streamUrl, title: channel.name },
    });
  }, [router]);

  const renderGuideRow = useCallback(({ item }: { item: Channel }) => {
    const info = EpgService.getProgramInfo(item.id, item.epgId);

    return (
      <AppCard style={styles.rowCard} variant="raised">
        <View style={styles.rowHeader}>
          <View style={styles.channelInfo}>
            <AppText variant="titleSmall" numberOfLines={1}>
              {item.name}
            </AppText>
            {item.countryCode ? (
              <AppBadge label={item.countryCode} status="info" />
            ) : null}
          </View>
          <Pressable
            onPress={() => handleLaunchChannel(item)}
            style={[styles.watchBtn, { backgroundColor: colors.primary }]}
            accessibilityLabel={`Watch ${item.name}`}>
            <Ionicons name="play-sharp" size={IconSizes.xs} color={colors.textInverse} />
            <AppText variant="caption" color="inverse" style={styles.watchText}>
              WATCH
            </AppText>
          </Pressable>
        </View>

        {/* Current & Next Program Details */}
        <View style={styles.programSection}>
          <View style={styles.programItem}>
            <AppBadge label="NOW" status="available" />
            <View style={styles.programDetails}>
              <AppText variant="bodySmall" numberOfLines={1}>
                {info.current?.title || FALLBACK_EPG_TEXT}
              </AppText>
              {info.current?.description ? (
                <AppText variant="caption" color="muted" numberOfLines={1}>
                  {info.current.description}
                </AppText>
              ) : null}
            </View>
          </View>

          {info.next ? (
            <View style={styles.programItem}>
              <AppBadge label="NEXT" status="info" />
              <View style={styles.programDetails}>
                <AppText variant="bodySmall" color="secondary" numberOfLines={1}>
                  {info.next.title}
                </AppText>
              </View>
            </View>
          ) : null}
        </View>
      </AppCard>
    );
  }, [colors, handleLaunchChannel]);

  const keyExtractor = useCallback((item: Channel) => item.id, []);

  return (
    <AppContainer padded={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.daySelector}>
          <Pressable
            onPress={() => setSelectedDay('today')}
            style={[
              styles.dayChip,
              {
                backgroundColor: selectedDay === 'today' ? colors.primary : colors.surfaceRaised,
                borderColor: selectedDay === 'today' ? colors.primaryLight : colors.borderSubtle,
              },
            ]}>
            <AppText
              variant="caption"
              style={{ color: selectedDay === 'today' ? colors.textInverse : colors.textPrimary }}>
              TODAY&apos;S GUIDE
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setSelectedDay('tomorrow')}
            style={[
              styles.dayChip,
              {
                backgroundColor: selectedDay === 'tomorrow' ? colors.primary : colors.surfaceRaised,
                borderColor: selectedDay === 'tomorrow' ? colors.primaryLight : colors.borderSubtle,
              },
            ]}>
            <AppText
              variant="caption"
              style={{ color: selectedDay === 'tomorrow' ? colors.textInverse : colors.textPrimary }}>
              TOMORROW
            </AppText>
          </Pressable>
        </View>

        {loading ? (
          <AppLoading message="Loading TV Guide schedule..." />
        ) : (
          <FlatList
            data={channels}
            renderItem={renderGuideRow}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={15}
            windowSize={8}
            removeClippedSubviews
          />
        )}
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  daySelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  dayChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowCard: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  channelInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  watchText: {
    fontWeight: '700',
  },
  programSection: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: Spacing.xs,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  programDetails: {
    flex: 1,
  },
});
