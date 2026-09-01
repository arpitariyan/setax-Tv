import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { Spacing } from '@/theme/tokens';

export interface AppLoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const AppLoading: React.FC<AppLoadingProps> = ({
  message = 'Loading...',
  size = 'medium' as any,
  fullScreen = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
        style,
      ]}>
      <ActivityIndicator size={size === 'large' ? 'large' : 'small'} color={colors.primary} />
      {message ? (
        <AppText variant="bodySmall" color="secondary" style={styles.text}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    marginTop: Spacing.xs,
  },
});
