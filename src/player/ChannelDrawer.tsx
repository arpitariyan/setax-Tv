import React from 'react';
import { StyleSheet, View, Modal, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppInput } from '@/components/ui';
import { ChannelCard } from '@/components/ChannelCard';
import { IconSizes, Spacing } from '@/theme/tokens';
import { Channel } from '@/types/channel';

export interface ChannelDrawerProps {
  visible: boolean;
  channels: Channel[];
  activeChannelId?: string;
  favorites: string[];
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onClose: () => void;
}

export const ChannelDrawer: React.FC<ChannelDrawerProps> = ({
  visible,
  channels,
  activeChannelId,
  favorites,
  onSelectChannel,
  onToggleFavorite,
  onClose,
}) => {
  const { colors } = useTheme();
  const [filterQuery, setFilterQuery] = React.useState('');

  const filteredChannels = React.useMemo(() => {
    if (!filterQuery.trim()) return channels;
    const q = filterQuery.toLowerCase().trim();
    return channels.filter((ch) => ch.normalizedName.includes(q) || (ch.country && ch.country.toLowerCase().includes(q)));
  }, [channels, filterQuery]);

  const renderItem = React.useCallback(
    ({ item }: { item: Channel }) => {
      const isSelected = item.id === activeChannelId;
      return (
        <View style={isSelected ? styles.selectedWrapper : undefined}>
          <ChannelCard
            channel={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            onPressChannel={(ch) => {
              onSelectChannel(ch);
              onClose();
            }}
          />
        </View>
      );
    },
    [activeChannelId, favorites, onToggleFavorite, onSelectChannel, onClose]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.drawer, { backgroundColor: colors.surfaceBase, borderColor: colors.borderDefault }]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <AppText variant="titleMedium">Quick Channel Switch</AppText>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close drawer">
              <Ionicons name="close-sharp" size={IconSizes.md} color={colors.textMuted} />
            </Pressable>
          </View>

          <AppInput
            value={filterQuery}
            onChangeText={setFilterQuery}
            onClear={() => setFilterQuery('')}
            placeholder="Filter drawer channels..."
          />

          <FlatList
            data={filteredChannels}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={15}
            windowSize={8}
            keyboardShouldPersistTaps="handled"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawer: {
    height: '75%',
    borderTopLeftRadius: Spacing.lg,
    borderTopRightRadius: Spacing.lg,
    borderTopWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  selectedWrapper: {
    borderRadius: Spacing.md,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
});
