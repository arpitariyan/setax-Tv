import React from 'react';
import { StyleSheet, View, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppButton } from '@/components/ui';
import { IconSizes, Spacing } from '@/theme/tokens';
import { StreamCapabilities } from '@/types/channel';
import { SleepTimerOption } from './useSleepTimer';

export interface PlayerAdvancedSettingsModalProps {
  visible: boolean;
  capabilities: StreamCapabilities;
  sleepTimerMinutes: SleepTimerOption;
  onSelectSleepTimer: (minutes: SleepTimerOption) => void;
  onClose: () => void;
}

export const PlayerAdvancedSettingsModal: React.FC<PlayerAdvancedSettingsModalProps> = ({
  visible,
  capabilities,
  sleepTimerMinutes,
  onSelectSleepTimer,
  onClose,
}) => {
  const { colors } = useTheme();

  const sleepTimerOptions: SleepTimerOption[] = [0, 15, 30, 45, 60];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surfaceBase, borderColor: colors.borderDefault }]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <AppText variant="titleMedium">Player Settings</AppText>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close settings">
              <Ionicons name="close-sharp" size={IconSizes.md} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.sheetContent}>
            {/* Sleep Timer Section */}
            <View style={styles.section}>
              <AppText variant="titleSmall" color="secondary">Sleep Timer</AppText>
              <View style={styles.optionRow}>
                {sleepTimerOptions.map((opt) => {
                  const isSelected = sleepTimerMinutes === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => onSelectSleepTimer(opt)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceRaised,
                          borderColor: isSelected ? colors.primaryLight : colors.borderSubtle,
                        },
                      ]}>
                      <AppText
                        variant="caption"
                        style={{ color: isSelected ? colors.textInverse : colors.textPrimary }}>
                        {opt === 0 ? 'OFF' : `${opt}M`}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Quality Section - Rendered ONLY if capabilities.qualitySelection is true */}
            {capabilities.qualitySelection ? (
              <View style={styles.section}>
                <AppText variant="titleSmall" color="secondary">Stream Quality</AppText>
                <AppText variant="bodySmall" color="muted">Auto (Best available)</AppText>
              </View>
            ) : (
              <View style={styles.section}>
                <AppText variant="titleSmall" color="secondary">Stream Quality</AppText>
                <AppText variant="caption" color="muted">Direct Stream (Single Variant)</AppText>
              </View>
            )}

            {/* Audio Tracks Section - Rendered ONLY if capabilities.audioTracks is true */}
            {capabilities.audioTracks ? (
              <View style={styles.section}>
                <AppText variant="titleSmall" color="secondary">Audio Track</AppText>
                <AppText variant="bodySmall" color="muted">Original Audio</AppText>
              </View>
            ) : null}

            {/* Subtitles Section - Rendered ONLY if capabilities.subtitles is true */}
            {capabilities.subtitles ? (
              <View style={styles.section}>
                <AppText variant="titleSmall" color="secondary">Subtitles / CC</AppText>
                <AppText variant="bodySmall" color="muted">Off</AppText>
              </View>
            ) : null}
          </ScrollView>

          <AppButton title="Done" variant="secondary" size="md" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.lg,
    borderTopRightRadius: Spacing.lg,
    borderTopWidth: 1,
    padding: Spacing.xl,
    maxHeight: '75%',
    gap: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetContent: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.md,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
});
