import React from 'react';
import { StyleSheet, View, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText, AppButton } from '@/components/ui';
import { IconSizes, Spacing } from '@/theme/tokens';
import { StreamCapabilities } from '@/types/channel';
import { SleepTimerOption } from './useSleepTimer';
import { TrackItem } from './VideoSurface';

export interface PlayerAdvancedSettingsModalProps {
  visible: boolean;
  capabilities: StreamCapabilities;
  sleepTimerMinutes: SleepTimerOption;
  audioTracks?: TrackItem[];
  subtitleTracks?: TrackItem[];
  qualities?: string[];
  selectedAudioTrackId?: string;
  selectedSubtitleTrackId?: string | null;
  selectedQuality?: string;
  onSelectSleepTimer: (minutes: SleepTimerOption) => void;
  onSelectAudioTrack?: (trackId: string) => void;
  onSelectSubtitleTrack?: (trackId: string | null) => void;
  onSelectQuality?: (quality: string) => void;
  onClose: () => void;
}

export const PlayerAdvancedSettingsModal: React.FC<PlayerAdvancedSettingsModalProps> = ({
  visible,
  capabilities,
  sleepTimerMinutes,
  audioTracks = [],
  subtitleTracks = [],
  qualities = [],
  selectedAudioTrackId,
  selectedSubtitleTrackId = null,
  selectedQuality = 'Auto',
  onSelectSleepTimer,
  onSelectAudioTrack,
  onSelectSubtitleTrack,
  onSelectQuality,
  onClose,
}) => {
  const { colors } = useTheme();

  const sleepTimerOptions: SleepTimerOption[] = [0, 15, 30, 45, 60];

  const hasMultipleAudio = capabilities.audioTracks && audioTracks.length > 1;
  const hasSubtitles = capabilities.subtitles && subtitleTracks.length > 0;
  const hasMultipleQualities = capabilities.qualitySelection && qualities.length > 1;

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

            {/* Quality Management Section (Section 25) */}
            <View style={styles.section}>
              <AppText variant="titleSmall" color="secondary">Stream Quality</AppText>
              {hasMultipleQualities ? (
                <View style={styles.optionRow}>
                  {['Auto', ...qualities].map((q) => {
                    const isSelected = selectedQuality === q;
                    return (
                      <Pressable
                        key={`q_${q}`}
                        onPress={() => onSelectQuality?.(q)}
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
                          {q}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <AppText variant="caption" color="muted">Direct Stream (Single Variant Exposed)</AppText>
              )}
            </View>

            {/* Audio Tracks Section (Section 26) - Rendered ONLY if multiple audio tracks exist */}
            {hasMultipleAudio && (
              <View style={styles.section}>
                <AppText variant="titleSmall" color="secondary">Audio Track</AppText>
                <View style={styles.optionRow}>
                  {audioTracks.map((track) => {
                    const isSelected = selectedAudioTrackId === track.id;
                    return (
                      <Pressable
                        key={`audio_${track.id}`}
                        onPress={() => onSelectAudioTrack?.(track.id)}
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
                          {track.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Subtitles / CC Section (Section 27) - Rendered ONLY if subtitle tracks exist */}
            {hasSubtitles && (
              <View style={styles.section}>
                <AppText variant="titleSmall" color="secondary">Subtitles / CC</AppText>
                <View style={styles.optionRow}>
                  <Pressable
                    onPress={() => onSelectSubtitleTrack?.(null)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selectedSubtitleTrackId === null ? colors.primary : colors.surfaceRaised,
                        borderColor: selectedSubtitleTrackId === null ? colors.primaryLight : colors.borderSubtle,
                      },
                    ]}>
                    <AppText
                      variant="caption"
                      style={{ color: selectedSubtitleTrackId === null ? colors.textInverse : colors.textPrimary }}>
                      OFF
                    </AppText>
                  </Pressable>

                  {subtitleTracks.map((track) => {
                    const isSelected = selectedSubtitleTrackId === track.id;
                    return (
                      <Pressable
                        key={`sub_${track.id}`}
                        onPress={() => onSelectSubtitleTrack?.(track.id)}
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
                          {track.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
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
