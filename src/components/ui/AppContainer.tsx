import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { MaxContentWidth, Spacing } from '@/theme/tokens';

export interface AppContainerProps extends ViewProps {
  maxWidth?: number;
  center?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export const AppContainer: React.FC<AppContainerProps> = ({
  children,
  maxWidth = MaxContentWidth,
  center = true,
  padded = true,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isWideScreen = width > maxWidth;

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: colors.background },
        style,
      ]}
      {...props}>
      <View
        style={[
          styles.inner,
          padded && styles.padded,
          isWideScreen && center && styles.centered,
          isWideScreen && { maxWidth, width: '100%' },
        ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  padded: {
    paddingHorizontal: Spacing.lg,
  },
  centered: {
    alignSelf: 'center',
  },
});
