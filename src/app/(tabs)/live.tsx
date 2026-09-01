import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppInput, AppLoading, AppContainer } from '@/components/ui';
import { ChannelCard } from '@/components/ChannelCard';
import { FilterBar, FilterOptionItem } from '@/components/FilterBar';
import { Spacing } from '@/theme/tokens';
import { PlaylistService } from '@/services/playlistService';
import { ChannelNormalizer } from '@/services/channelNormalizer';
import { getFavorites, addFavorite, removeFavorite } from '@/storage';
import { Channel } from '@/types/channel';

export default function LiveScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const favs = await getFavorites();
      setFavorites(favs);

      const result = await PlaylistService.loadPlaylist({ forceRefresh });
      const normalized = ChannelNormalizer.normalizeCatalogue(result.items);
      setChannels(normalized);
      setErrorMessage(null);
    } catch (error) {
      console.error('[LiveScreen] Error loading channels', error);
      setErrorMessage('Failed to load playlist. Verify internet connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

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

  const categoriesOptions: FilterOptionItem[] = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((ch) => {
      ch.categories.forEach((cat) => set.add(cat));
    });
    const items: FilterOptionItem[] = [{ id: 'all', label: 'All Channels' }];
    Array.from(set)
      .slice(0, 15)
      .forEach((cat) => {
        items.push({ id: cat, label: cat });
      });
    return items;
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return ChannelNormalizer.filterChannels(channels, {
      searchQuery,
      category: selectedCategory,
      favoritesOnly,
      favoriteIds: favorites,
    });
  }, [channels, searchQuery, selectedCategory, favoritesOnly, favorites]);

  const renderItem = useCallback(
    ({ item }: { item: Channel }) => (
      <ChannelCard
        channel={item}
        isFavorite={favorites.includes(item.id)}
        onToggleFavorite={handleToggleFavorite}
        onPressChannel={handlePressChannel}
      />
    ),
    [favorites, handleToggleFavorite, handlePressChannel]
  );

  const keyExtractor = useCallback((item: Channel) => item.id, []);

  return (
    <AppContainer padded={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <AppInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search channels, countries, categories..."
          />
          <FilterBar
            categories={categoriesOptions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
          />
        </View>

        {loading ? (
          <AppLoading message="Ingesting IPTV-org channels..." fullScreen={false} />
        ) : errorMessage ? (
          <View style={styles.centerContainer}>
            <AppText variant="titleSmall" color="muted" align="center">
              {errorMessage}
            </AppText>
          </View>
        ) : filteredChannels.length === 0 ? (
          <View style={styles.centerContainer}>
            <AppText variant="titleSmall" color="secondary" align="center">
              No channels found matching criteria
            </AppText>
          </View>
        ) : (
          <FlatList
            data={filteredChannels}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            initialNumToRender={12}
            maxToRenderPerBatch={16}
            windowSize={10}
            removeClippedSubviews
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                tintColor={colors.primary}
              />
            }
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
});
