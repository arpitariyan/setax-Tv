import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { BorderRadius, Spacing } from '@/theme/tokens';

export type BadgeStatus = 'available' | 'unstable' | 'unavailable' | 'unknown' | 'info';

export interface AppBadgeProps {
  label: string;
  status?: BadgeStatus;
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  status = 'info',
  style,
}) => {
  const { colors } = useTheme();

  const getStatusColors = () => {
    switch (status) {
      case 'available':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.statusAvailable, border: 'rgba(16, 185, 129, 0.3)' };
      case 'unstable':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.statusUnstable, border: 'rgba(245, 158, 11, 0.3)' };
      case 'unavailable':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.statusUnavailable, border: 'rgba(239, 68, 68, 0.3)' };
      case 'unknown':
        return { bg: 'rgba(107, 114, 128, 0.15)', text: colors.statusUnknown, border: 'rgba(107, 114, 128, 0.3)' };
      case 'info':
      default:
        return { bg: 'rgba(2, 132, 199, 0.15)', text: colors.primaryLight, border: 'rgba(2, 132, 199, 0.3)' };
    }
  };

  const statusColors = getStatusColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColors.bg,
          borderColor: statusColors.border,
        },
        style,
      ]}>
      <AppText variant="badge" style={{ color: statusColors.text }}>
        {label.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
