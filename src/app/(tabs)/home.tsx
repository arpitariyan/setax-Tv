import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppButton, AppCard, AppBadge, AppContainer } from '@/components/ui';
import { ChannelCard } from '@/components/ChannelCard';
import { Spacing } from '@/theme/tokens';
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

  const featuredChannels = useMemo(() => {
    return allChannels.slice(0, 6);
  }, [allChannels]);

  const recentlyWatchedChannels = useMemo(() => {
    const channelMap = new Map(allChannels.map((c) => [c.id, c]));
    return recentlyWatchedIds
      .map((id) => channelMap.get(id))
      .filter((c): c is Channel => Boolean(c))
      .slice(0, 5);
  }, [allChannels, recentlyWatchedIds]);

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
          <View style={styles.header}>
            <View>
              <AppText variant="titleLarge">Live TV</AppText>
              <AppText variant="bodySmall" color="secondary">
                Public Live Broadcast Catalogue
              </AppText>
            </View>
            <AppBadge label="IPTV-ORG" status="available" />
          </View>

          <AppCard style={styles.bannerCard} variant="raised">
            <AppText variant="titleMedium">Explore World Television</AppText>
            <AppText variant="bodyMedium" color="secondary">
              Watch live channels directly from public broadcasts without logins or fees.
            </AppText>
            <View style={styles.bannerActions}>
              <AppButton
                title="Browse Full Catalogue"
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="tv-sharp" size={18} color={colors.textInverse} />}
                onPress={() => router.push('/live')}
              />
            </View>
          </AppCard>

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

          {/* Featured Live Channels Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="titleMedium">Featured Channels</AppText>
            </View>
            <View style={styles.channelList}>
              {featuredChannels.map((channel) => (
                <ChannelCard
                  key={`feat_${channel.id}`}
                  channel={channel}
                  isFavorite={favorites.includes(channel.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onPressChannel={handlePressChannel}
                />
              ))}
            </View>
          </View>
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
  bannerCard: {
    gap: Spacing.sm,
  },
  bannerActions: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
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
});
