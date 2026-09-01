import React from 'react';
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, Spacing } from '@/theme/tokens';

export interface AppCardProps extends ViewProps {
  interactive?: boolean;
  onPress?: () => void;
  variant?: 'base' | 'raised' | 'overlay';
  style?: ViewStyle;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  interactive = false,
  onPress,
  variant = 'raised',
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = (pressed?: boolean) => {
    let bg = colors.surfaceRaised;
    if (variant === 'base') bg = colors.surfaceBase;
    if (variant === 'overlay') bg = colors.surfaceOverlay;

    if (pressed && interactive) {
      if (variant === 'raised') bg = colors.surfaceOverlay;
      else if (variant === 'base') bg = colors.surfaceRaised;
    }
    return bg;
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: BorderRadius.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    padding: Spacing.lg,
  };

  if (interactive && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          cardStyle,
          { backgroundColor: getBackgroundColor(pressed) },
          style,
        ]}
        {...props}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
