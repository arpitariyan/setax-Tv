import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
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

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  useEffect(() => {
    async function initSearchData() {
      try {
        setLoading(true);
        const favs = await getFavorites();
        setFavorites(favs);

        const result = await PlaylistService.loadPlaylist();
        const normalized = ChannelNormalizer.normalizeCatalogue(result.items);
        setChannels(normalized);
      } catch (error) {
        console.warn('[SearchScreen] Error loading search dataset', error);
      } finally {
        setLoading(false);
      }
    }

    initSearchData();
  }, []);

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
    const items: FilterOptionItem[] = [{ id: 'all', label: 'All Categories' }];
    Array.from(set)
      .slice(0, 15)
      .forEach((cat) => {
        items.push({ id: cat, label: cat });
      });
    return items;
  }, [channels]);

  const searchResults = useMemo(() => {
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
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search channels by name, country, or category..."
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
          <AppLoading message="Preparing search index..." />
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText variant="titleSmall" color="secondary" align="center">
              {searchQuery ? `No results found for "${searchQuery}"` : 'Type to search channels'}
            </AppText>
            <AppText variant="bodySmall" color="muted" align="center">
              Search works instantly across channel names, languages, categories, and countries.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            initialNumToRender={14}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews
            keyboardShouldPersistTaps="handled"
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
});
