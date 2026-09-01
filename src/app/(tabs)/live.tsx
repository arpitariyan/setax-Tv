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
import { Channel, ChannelStatus } from '@/types/channel';

export default function LiveScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ChannelStatus | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [indiaOnly, setIndiaOnly] = useState<boolean>(false);
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
    const items: FilterOptionItem[] = [{ id: 'all', label: 'All Categories' }];
    Array.from(set)
      .slice(0, 15)
      .forEach((cat) => {
        items.push({ id: cat, label: cat });
      });
    return items;
  }, [channels]);

  const indianStatesOptions: FilterOptionItem[] = useMemo(() => {
    return [
      { id: 'all', label: 'All States' },
      { id: 'delhi', label: 'Delhi' },
      { id: 'maharashtra', label: 'Maharashtra' },
      { id: 'tamil nadu', label: 'Tamil Nadu' },
      { id: 'kerala', label: 'Kerala' },
      { id: 'karnataka', label: 'Karnataka' },
      { id: 'andhra', label: 'Andhra Pradesh' },
    ];
  }, []);

  const indianLanguagesOptions: FilterOptionItem[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Languages' },
      { id: 'hindi', label: 'Hindi' },
      { id: 'tamil', label: 'Tamil' },
      { id: 'telugu', label: 'Telugu' },
      { id: 'malayalam', label: 'Malayalam' },
      { id: 'bengali', label: 'Bengali' },
      { id: 'marathi', label: 'Marathi' },
      { id: 'kannada', label: 'Kannada' },
      { id: 'punjabi', label: 'Punjabi' },
      { id: 'gujarati', label: 'Gujarati' },
      { id: 'bhojpuri', label: 'Bhojpuri' },
    ];
  }, []);

  const filteredChannels = useMemo(() => {
    return ChannelNormalizer.filterChannels(channels, {
      searchQuery,
      category: selectedCategory,
      subdivision: selectedState,
      language: selectedLanguage,
      status: selectedStatus,
      favoritesOnly,
      favoriteIds: favorites,
      indiaOnly,
    });
  }, [channels, searchQuery, selectedCategory, selectedState, selectedLanguage, selectedStatus, favoritesOnly, favorites, indiaOnly]);

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
            placeholder="Search channels, states, languages..."
          />
          <FilterBar
            categories={categoriesOptions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
            indiaOnly={indiaOnly}
            onToggleIndiaOnly={() => setIndiaOnly((prev) => !prev)}
            states={indianStatesOptions}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            languages={indianLanguagesOptions}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />
        </View>

        {loading ? (
          <AppLoading message="Ingesting Live TV channels..." fullScreen={false} />
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
