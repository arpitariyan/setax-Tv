import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppCard, AppBadge, AppLoading, AppContainer, AppInput } from '@/components/ui';
import { Spacing, IconSizes, BorderRadius } from '@/theme/tokens';
import { PlaylistService } from '@/services/playlistService';
import { ChannelNormalizer } from '@/services/channelNormalizer';
import { EpgService, FALLBACK_EPG_TEXT } from '@/services/epgService';
import { Channel } from '@/types/channel';

const CATEGORIES = ['All', 'News', 'Movies', 'Music', 'Devotional', 'Entertainment', 'Sports'];

export default function GuideScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function initGuide() {
      try {
        setLoading(true);
        await EpgService.loadEpg();
        const res = await PlaylistService.loadPlaylist();
        const normalized = ChannelNormalizer.normalizeCatalogue(res.items);
        setAllChannels(normalized);
      } catch (err) {
        console.warn('[GuideScreen] Failed loading EPG guide dataset', err);
      } finally {
        setLoading(false);
      }
    }

    initGuide();
  }, []);

  const filteredChannels = useMemo(() => {
    return ChannelNormalizer.filterChannels(allChannels, {
      category: selectedCategory === 'All' ? null : selectedCategory,
      searchQuery: searchQuery.trim() || undefined,
    });
  }, [allChannels, selectedCategory, searchQuery]);

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
            <AppText variant="titleSmall" numberOfLines={1} style={styles.channelName}>
              {item.name}
            </AppText>
            {item.countryCode ? (
              <AppBadge label={item.countryCode} status="info" />
            ) : null}
          </View>
          <Pressable
            onPress={() => handleLaunchChannel(item)}
            style={[styles.watchBtn, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={`Watch live ${item.name}`}
            accessibilityHint="Double tap to play live stream">
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
              <View style={styles.programTitleRow}>
                <AppText variant="bodySmall" numberOfLines={1} style={{ flex: 1 }}>
                  {info.current?.title || FALLBACK_EPG_TEXT}
                </AppText>
                {info.currentFormattedTime ? (
                  <AppText variant="caption" color="muted">
                    {info.currentFormattedTime}
                  </AppText>
                ) : null}
              </View>
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
                <View style={styles.programTitleRow}>
                  <AppText variant="bodySmall" color="secondary" numberOfLines={1} style={{ flex: 1 }}>
                    {info.next.title}
                  </AppText>
                  {info.nextFormattedTime ? (
                    <AppText variant="caption" color="muted">
                      {info.nextFormattedTime}
                    </AppText>
                  ) : null}
                </View>
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
        {/* Header Controls */}
        <View style={styles.headerControls}>
          {/* Day Chips */}
          <View style={styles.daySelector}>
            <Pressable
              onPress={() => setSelectedDay('today')}
              accessibilityRole="button"
              accessibilityLabel="Show Today's Guide"
              style={[
                styles.dayChip,
                {
                  backgroundColor: selectedDay === 'today' ? colors.primary : colors.surfaceRaised,
                  borderColor: selectedDay === 'today' ? colors.primaryLight : colors.borderSubtle,
                },
              ]}>
              <AppText
                variant="caption"
                style={{ color: selectedDay === 'today' ? colors.textInverse : colors.textPrimary, fontWeight: '700' }}>
                TODAY&apos;S GUIDE
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setSelectedDay('tomorrow')}
              accessibilityRole="button"
              accessibilityLabel="Show Tomorrow's Guide"
              style={[
                styles.dayChip,
                {
                  backgroundColor: selectedDay === 'tomorrow' ? colors.primary : colors.surfaceRaised,
                  borderColor: selectedDay === 'tomorrow' ? colors.borderSubtle : colors.borderSubtle,
                },
              ]}>
              <AppText
                variant="caption"
                style={{ color: selectedDay === 'tomorrow' ? colors.textInverse : colors.textPrimary, fontWeight: '700' }}>
                TOMORROW
              </AppText>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <AppInput
              placeholder="Search schedule by channel name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Chips */}
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryBar}
            renderItem={({ item }) => {
              const active = selectedCategory === item;
              return (
                <Pressable
                  onPress={() => setSelectedCategory(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter guide by ${item}`}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceBase,
                      borderColor: active ? colors.primaryLight : colors.borderSubtle,
                    },
                  ]}>
                  <AppText
                    variant="caption"
                    style={{ color: active ? colors.textInverse : colors.textSecondary, fontWeight: active ? '700' : '400' }}>
                    {item}
                  </AppText>
                </Pressable>
              );
            }}
          />
        </View>

        {loading ? (
          <AppLoading message="Loading TV Guide schedule..." />
        ) : filteredChannels.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={IconSizes.xl} color={colors.textMuted} />
            <AppText variant="titleMedium">No Schedules Found</AppText>
            <AppText variant="bodyMedium" color="muted" style={styles.emptyText}>
              Try adjusting your search query or category filter.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={filteredChannels}
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
  headerControls: {
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  daySelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dayChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  categoryBar: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 44,
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
  channelName: {
    fontWeight: '700',
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    minHeight: 44,
    minWidth: 80,
    justifyContent: 'center',
  },
  watchText: {
    fontWeight: '700',
  },
  programSection: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
});
