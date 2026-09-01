import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppButton, AppCard, AppBadge, AppContainer } from '@/components/ui';
import { ChannelCard } from '@/components/ChannelCard';
import { BorderRadius, IconSizes, Spacing } from '@/theme/tokens';
import { PlaylistService } from '@/services/playlistService';
import { ChannelNormalizer } from '@/services/channelNormalizer';
import { getFavorites, addFavorite, removeFavorite, getRecentlyWatched, clearRecentlyWatched } from '@/storage';
import { Channel } from '@/types/channel';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyWatchedIds, setRecentlyWatchedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);

      const recent = await getRecentlyWatched();
      setRecentlyWatchedIds(recent.map((r) => r.channelId));

      const result = await PlaylistService.loadPlaylist();
      const normalized = ChannelNormalizer.normalizeCatalogue(result.items);
      setAllChannels(normalized);
    } catch (error) {
      console.warn('[HomeScreen] Error loading homepage dataset', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const indianChannels = useMemo(() => {
    return allChannels.filter((c) => ChannelNormalizer.isIndiaChannel(c)).slice(0, 6);
  }, [allChannels]);

  const favoriteChannels = useMemo(() => {
    const favSet = new Set(favorites);
    return allChannels.filter((c) => favSet.has(c.id)).slice(0, 4);
  }, [allChannels, favorites]);

  const recentlyWatchedChannels = useMemo(() => {
    const channelMap = new Map(allChannels.map((c) => [c.id, c]));
    return recentlyWatchedIds
      .map((id) => channelMap.get(id))
      .filter((c): c is Channel => Boolean(c))
      .slice(0, 4);
  }, [allChannels, recentlyWatchedIds]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allChannels.forEach((c) => c.categories.forEach((cat) => set.add(cat)));
    return Array.from(set).slice(0, 10);
  }, [allChannels]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    allChannels.forEach((c) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).slice(0, 10);
  }, [allChannels]);

  const handleToggleFavorite = useCallback(async (channelId: string) => {
    if (favorites.includes(channelId)) {
      const updated = await removeFavorite(channelId);
      setFavorites(updated);
    } else {
      const updated = await addFavorite(channelId);
      setFavorites(updated);
    }
  }, [favorites]);

  const handlePressChannel = useCallback((channel: Channel) => {
    router.push({
      pathname: '/player/[id]',
      params: { id: channel.id, streamUrl: channel.streamUrl, title: channel.name },
    });
  }, [router]);

  const handleClearHistory = useCallback(async () => {
    await clearRecentlyWatched();
    setRecentlyWatchedIds([]);
  }, []);

  return (
    <AppContainer padded={false}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={colors.primary}
          />
        }>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <AppText variant="titleLarge">Live TV</AppText>
              <AppText variant="bodySmall" color="secondary">
                Public Live Broadcast Catalogue
              </AppText>
            </View>
            <AppBadge label="INDIA FIRST" status="available" />
          </View>

          {/* Search Bar Entry Trigger */}
          <Pressable
            onPress={() => router.push('/search')}
            style={[styles.searchBar, { backgroundColor: colors.surfaceBase, borderColor: colors.borderDefault }]}>
            <Ionicons name="search-sharp" size={IconSizes.sm} color={colors.textMuted} />
            <AppText variant="bodyMedium" color="muted">
              Search channels, countries, categories...
            </AppText>
          </Pressable>

          {/* Quick TV Guide Shortcut Banner */}
          <AppCard style={styles.bannerCard} variant="raised">
            <View style={styles.bannerHeader}>
              <View style={styles.bannerText}>
                <AppText variant="titleMedium">Live Schedule & Guide</AppText>
                <AppText variant="bodySmall" color="secondary">
                  Check upcoming programmes and channel schedules.
                </AppText>
              </View>
              <AppButton
                title="TV Guide"
                variant="primary"
                size="sm"
                leftIcon={<Ionicons name="calendar-sharp" size={16} color={colors.textInverse} />}
                onPress={() => router.push('/guide')}
              />
            </View>
          </AppCard>

          {/* India Priority Channels Section */}
          {indianChannels.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <AppText variant="titleMedium">🇮🇳 Featured India Channels</AppText>
                <AppButton title="See All" variant="ghost" size="sm" onPress={() => router.push('/live')} />
              </View>
              <View style={styles.channelList}>
                {indianChannels.map((channel) => (
                  <ChannelCard
                    key={`india_${channel.id}`}
                    channel={channel}
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onPressChannel={handlePressChannel}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Favorites Preview Section */}
          {favoriteChannels.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <AppText variant="titleMedium">♥ Favorites Preview</AppText>
                <AppButton title="View All" variant="ghost" size="sm" onPress={() => router.push('/favorites')} />
              </View>
              <View style={styles.channelList}>
                {favoriteChannels.map((channel) => (
                  <ChannelCard
                    key={`fav_${channel.id}`}
                    channel={channel}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onPressChannel={handlePressChannel}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Recently Watched Section */}
          {recentlyWatchedChannels.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <AppText variant="titleMedium">Recently Watched</AppText>
                <AppButton title="Clear" variant="ghost" size="sm" onPress={handleClearHistory} />
              </View>
              <View style={styles.channelList}>
                {recentlyWatchedChannels.map((channel) => (
                  <ChannelCard
                    key={`recent_${channel.id}`}
                    channel={channel}
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onPressChannel={handlePressChannel}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Browse Categories Horizontal Section */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <AppText variant="titleMedium">Categories</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {categories.map((cat) => (
                  <Pressable
                    key={`cat_chip_${cat}`}
                    onPress={() => router.push('/live')}
                    style={[styles.chip, { backgroundColor: colors.surfaceRaised, borderColor: colors.borderSubtle }]}>
                    <AppText variant="caption" color="secondary">
                      {cat.toUpperCase()}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Browse Countries Horizontal Section */}
          {countries.length > 0 && (
            <View style={styles.section}>
              <AppText variant="titleMedium">Countries</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {countries.map((country) => (
                  <Pressable
                    key={`country_chip_${country}`}
                    onPress={() => router.push('/live')}
                    style={[styles.chip, { backgroundColor: colors.surfaceRaised, borderColor: colors.borderSubtle }]}>
                    <AppText variant="caption" color="secondary">
                      {country.toUpperCase()}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  bannerCard: {
    padding: Spacing.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  bannerText: {
    flex: 1,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelList: {
    gap: Spacing.md,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
