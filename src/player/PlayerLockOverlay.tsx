import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/ui';
import { IconSizes, Spacing } from '@/theme/tokens';

export interface PlayerLockOverlayProps {
  locked: boolean;
  onUnlock: () => void;
}

export const PlayerLockOverlay: React.FC<PlayerLockOverlayProps> = ({
  locked,
  onUnlock,
}) => {
  const { colors } = useTheme();

  if (!locked) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable
        onPress={onUnlock}
        style={[styles.unlockButton, { backgroundColor: colors.overlay }]}
        accessibilityLabel="Unlock Controls">
        <Ionicons name="lock-closed-sharp" size={IconSizes.md} color="#EF4444" />
        <AppText variant="caption" color="primary">
          TAP TO UNLOCK
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    zIndex: 30,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
});
