import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppBadge, AppButton, AppLoading, AppContainer } from '@/components/ui';
import { ChannelCard } from '@/components/ChannelCard';
import { Spacing } from '@/theme/tokens';
import { PlaylistService } from '@/services/playlistService';
import { ChannelNormalizer } from '@/services/channelNormalizer';
import { getFavorites, removeFavorite, clearFavorites } from '@/storage';
import { Channel } from '@/types/channel';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const favs = await getFavorites();
      setFavoriteIds(favs);

      const res = await PlaylistService.loadPlaylist();
      const normalized = ChannelNormalizer.normalizeCatalogue(res.items);
      setAllChannels(normalized);
    } catch (err) {
      console.warn('[FavoritesScreen] Failed loading favorites context', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const favoriteChannels = useMemo(() => {
    const favSet = new Set(favoriteIds);
    return allChannels.filter((ch) => favSet.has(ch.id));
  }, [allChannels, favoriteIds]);

  const handleRemoveFavorite = useCallback(async (channelId: string) => {
    const updated = await removeFavorite(channelId);
    setFavoriteIds(updated);
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all saved favorite channels?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearFavorites();
            setFavoriteIds([]);
          },
        },
      ]
    );
  }, []);

  const handlePressChannel = useCallback((channel: Channel) => {
    router.push({
      pathname: '/player/[id]',
      params: { id: channel.id, streamUrl: channel.streamUrl, title: channel.name },
    });
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Channel }) => (
      <ChannelCard
        channel={item}
        isFavorite={true}
        onToggleFavorite={handleRemoveFavorite}
        onPressChannel={handlePressChannel}
      />
    ),
    [handleRemoveFavorite, handlePressChannel]
  );

  const keyExtractor = useCallback((item: Channel) => item.id, []);

  return (
    <AppContainer padded={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <AppText variant="titleMedium">Your Favorites</AppText>
            <AppBadge label={`${favoriteChannels.length} SAVED`} status="available" />
          </View>
          {favoriteChannels.length > 0 && (
            <AppButton
              title="Clear All"
              variant="ghost"
              size="sm"
              onPress={handleClearAll}
            />
          )}
        </View>

        {loading ? (
          <AppLoading message="Loading favorites..." />
        ) : favoriteChannels.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-dislike-sharp" size={48} color={colors.textMuted} />
            <AppText variant="titleSmall" color="secondary" align="center">
              No favorites saved yet
            </AppText>
            <AppText variant="bodySmall" color="muted" align="center">
              Tap the heart icon on any channel to save it to your local device storage.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={favoriteChannels}
            renderItem={renderItem}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
});
