import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppButton } from '@/components/ui';
import { Spacing } from '@/theme/tokens';

export interface PlayerErrorViewProps {
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const PlayerErrorView: React.FC<PlayerErrorViewProps> = ({
  message = 'Stream unavailable or network disconnected.',
  onRetry,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay }]}>
      <View style={[styles.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.borderDefault }]}>
        <Ionicons name="alert-circle-sharp" size={48} color={colors.statusUnavailable} />
        <AppText variant="titleMedium" align="center">
          Playback Problem
        </AppText>
        <AppText variant="bodySmall" color="secondary" align="center">
          {message}
        </AppText>
        <View style={styles.actions}>
          {onRetry && (
            <AppButton
              title="Try Again"
              variant="primary"
              size="md"
              leftIcon={<Ionicons name="refresh-sharp" size={18} color={colors.textInverse} />}
              onPress={onRetry}
            />
          )}
          {onClose && (
            <AppButton
              title="Exit Player"
              variant="outline"
              size="md"
              onPress={onClose}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    zIndex: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: Spacing.xl,
    borderRadius: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
});
