import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppButton } from '@/components/ui';
import { Spacing } from '@/theme/tokens';

export interface PlayerErrorViewProps {
  message?: string;
  retryCount?: number;
  onRetry?: () => void;
  onClose?: () => void;
}

export const PlayerErrorView: React.FC<PlayerErrorViewProps> = ({
  message,
  retryCount = 0,
  onRetry,
  onClose,
}) => {
  const { colors } = useTheme();

  const humanReadableError = useMemo(() => {
    if (!message) {
      return { title: 'Stream Unavailable', detail: 'This live broadcast is currently unreachable or offline.' };
    }
    const lower = message.toLowerCase();
    if (lower.includes('network') || lower.includes('offline') || lower.includes('internet')) {
      return { title: 'Network Offline', detail: 'Please check your internet connection and try again.' };
    }
    if (lower.includes('timeout') || lower.includes('timed out')) {
      return { title: 'Stream Timeout', detail: 'The live broadcast server took too long to respond.' };
    }
    if (lower.includes('manifest') || lower.includes('parse') || lower.includes('m3u8')) {
      return { title: 'Stream Format Error', detail: 'The broadcast manifest could not be loaded.' };
    }
    if (lower.includes('unsupported') || lower.includes('format') || lower.includes('codec')) {
      return { title: 'Unsupported Format', detail: 'Your device media player cannot decode this stream format.' };
    }
    return { title: 'Stream Unavailable', detail: 'This channel stream is temporarily unavailable.' };
  }, [message]);

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay }]}>
      <View style={[styles.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.borderDefault }]}>
        <Ionicons name="alert-circle-sharp" size={48} color={colors.statusUnavailable} />
        <AppText variant="titleMedium" align="center">
          {humanReadableError.title}
        </AppText>
        <AppText variant="bodySmall" color="secondary" align="center">
          {humanReadableError.detail}
        </AppText>
        {retryCount > 0 && (
          <AppText variant="caption" color="muted" align="center">
            Attempted {retryCount} automatic retries
          </AppText>
        )}
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
