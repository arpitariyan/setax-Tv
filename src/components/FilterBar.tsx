import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/ui';
import { BorderRadius, Spacing } from '@/theme/tokens';

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
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  favoritesOnly,
  onToggleFavoritesOnly,
}) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
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

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <Pressable
            key={cat.id}
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
  );
};

const styles = StyleSheet.create({
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
});
