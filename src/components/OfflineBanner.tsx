import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkState } from '@/hooks/useNetworkState';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/ui';
import { IconSizes, Spacing } from '@/theme/tokens';

export const OfflineBanner: React.FC = () => {
  const { isConnected } = useNetworkState();
  const { colors } = useTheme();

  if (isConnected) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: colors.statusUnavailable }]}>
      <Ionicons name="cloud-offline-sharp" size={IconSizes.xs} color="#FFFFFF" />
      <AppText variant="caption" style={styles.text}>
        NO INTERNET CONNECTION — SHOWING LOCAL CACHED CATALOGUE
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
