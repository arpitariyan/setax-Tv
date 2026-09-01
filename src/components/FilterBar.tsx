import React from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/ui';
import { BorderRadius, Spacing } from '@/theme/tokens';
import { ChannelStatus } from '@/types/channel';

export interface FilterOptionItem {
  id: string;
  label: string;
}

export interface FilterBarProps {
  categories: FilterOptionItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  indiaOnly?: boolean;
  onToggleIndiaOnly?: () => void;
  states?: FilterOptionItem[];
  selectedState?: string;
  onSelectState?: (id: string) => void;
  languages?: FilterOptionItem[];
  selectedLanguage?: string;
  onSelectLanguage?: (id: string) => void;
  selectedStatus?: ChannelStatus | 'all';
  onSelectStatus?: (status: ChannelStatus | 'all') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  favoritesOnly,
  onToggleFavoritesOnly,
  indiaOnly = false,
  onToggleIndiaOnly,
  states = [],
  selectedState = 'all',
  onSelectState,
  languages = [],
  selectedLanguage = 'all',
  onSelectLanguage,
  selectedStatus = 'all',
  onSelectStatus,
}) => {
  const { colors } = useTheme();

  const statusOptions: { id: ChannelStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Status' },
    { id: 'available', label: 'Available' },
    { id: 'unstable', label: 'Unstable' },
    { id: 'unavailable', label: 'Unavailable' },
  ];

  return (
    <View style={styles.wrapper}>
      {/* Primary Row: India Priority, Favorites, Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {/* India Priority Filter Chip */}
        {onToggleIndiaOnly && (
          <Pressable
            onPress={onToggleIndiaOnly}
            style={[
              styles.pill,
              {
                backgroundColor: indiaOnly ? 'rgba(16, 185, 129, 0.25)' : colors.surfaceRaised,
                borderColor: indiaOnly ? '#10B981' : colors.borderSubtle,
              },
            ]}>
            <AppText
              variant="badge"
              style={{ color: indiaOnly ? '#10B981' : colors.textSecondary, fontWeight: '700' }}>
              🇮🇳 INDIA CHANNELS
            </AppText>
          </Pressable>
        )}

        {/* Favorites Filter Chip */}
        <Pressable
          onPress={onToggleFavoritesOnly}
          style={[
            styles.pill,
            {
              backgroundColor: favoritesOnly ? 'rgba(239, 68, 68, 0.2)' : colors.surfaceRaised,
              borderColor: favoritesOnly ? '#EF4444' : colors.borderSubtle,
            },
          ]}>
          <AppText
            variant="badge"
            style={{ color: favoritesOnly ? '#EF4444' : colors.textSecondary }}>
            ♥ FAVORITES
          </AppText>
        </Pressable>

        {/* Status Filters */}
        {onSelectStatus &&
          statusOptions.map((st) => {
            const isSelected = selectedStatus === st.id;
            return (
              <Pressable
                key={`status_${st.id}`}
                onPress={() => onSelectStatus(st.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? '#F59E0B' : colors.surfaceRaised,
                    borderColor: isSelected ? '#FBBF24' : colors.borderSubtle,
                  },
                ]}>
                <AppText
                  variant="badge"
                  style={{ color: isSelected ? colors.textInverse : colors.textSecondary }}>
                  {st.label.toUpperCase()}
                </AppText>
              </Pressable>
            );
          })}

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <Pressable
              key={`cat_${cat.id}`}
              onPress={() => onSelectCategory(cat.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceRaised,
                  borderColor: isSelected ? colors.primaryLight : colors.borderSubtle,
                },
              ]}>
              <AppText
                variant="badge"
                style={{ color: isSelected ? colors.textInverse : colors.textSecondary }}>
                {cat.label.toUpperCase()}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sub-row for States or Languages when available */}
      {((states.length > 0 && onSelectState) || (languages.length > 0 && onSelectLanguage)) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.container}>
          {states.length > 0 && onSelectState && (
            <>
              {states.map((st) => {
                const isSelected = selectedState === st.id;
                return (
                  <Pressable
                    key={`state_${st.id}`}
                    onPress={() => onSelectState(st.id)}
                    style={[
                      styles.pillSmall,
                      {
                        backgroundColor: isSelected ? '#0EA5E9' : colors.surfaceBase,
                        borderColor: isSelected ? '#38BDF8' : colors.borderSubtle,
                      },
                    ]}>
                    <AppText
                      variant="caption"
                      style={{ color: isSelected ? colors.textInverse : colors.textMuted }}>
                      {st.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </>
          )}

          {languages.length > 0 && onSelectLanguage && (
            <>
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <Pressable
                    key={`lang_${lang.id}`}
                    onPress={() => onSelectLanguage(lang.id)}
                    style={[
                      styles.pillSmall,
                      {
                        backgroundColor: isSelected ? '#8B5CF6' : colors.surfaceBase,
                        borderColor: isSelected ? '#A78BFA' : colors.borderSubtle,
                      },
                    ]}>
                    <AppText
                      variant="caption"
                      style={{ color: isSelected ? colors.textInverse : colors.textMuted }}>
                      {lang.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  container: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  pillSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
  },
});
