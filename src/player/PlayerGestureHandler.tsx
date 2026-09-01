import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, PanResponder, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from '@/components/ui';
import { IconSizes, Spacing } from '@/theme/tokens';

export interface PlayerGestureHandlerProps {
  seekable: boolean;
  onTap: () => void;
  onDoubleTapSeekBackward?: () => void;
  onDoubleTapSeekForward?: () => void;
  children: React.ReactNode;
}

export const PlayerGestureHandler: React.FC<PlayerGestureHandlerProps> = ({
  seekable,
  onTap,
  onDoubleTapSeekBackward,
  onDoubleTapSeekForward,
  children,
}) => {
  const { colors } = useTheme();

  const [feedbackType, setFeedbackType] = useState<'volume' | 'brightness' | 'seek_back' | 'seek_fwd' | null>(null);
  const [feedbackLevel, setFeedbackLevel] = useState<number>(50);

  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackFadeAnim = useRef(new Animated.Value(0)).current;

  const showFeedback = useCallback((type: 'volume' | 'brightness' | 'seek_back' | 'seek_fwd', level = 50) => {
    setFeedbackType(type);
    setFeedbackLevel(level);
    feedbackFadeAnim.setValue(1);

    Animated.timing(feedbackFadeAnim, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    }).start(() => {
      setFeedbackType(null);
    });
  }, [feedbackFadeAnim]);

  const handlePress = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
      lastTapRef.current = 0;

      if (seekable) {
        // Double tap right side seek forward, left side seek backward
        showFeedback('seek_fwd');
        onDoubleTapSeekForward?.();
      }
    } else {
      lastTapRef.current = now;
      singleTapTimerRef.current = setTimeout(() => {
        onTap();
      }, DOUBLE_TAP_DELAY);
    }
  }, [seekable, onTap, onDoubleTapSeekForward, showFeedback]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 15;
      },
      onPanResponderMove: (_, gestureState) => {
        const delta = Math.round((-gestureState.dy / 200) * 100);
        const level = Math.max(0, Math.min(100, 50 + delta));

        if (gestureState.moveX < 180) {
          showFeedback('brightness', level);
        } else {
          showFeedback('volume', level);
        }
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Pressable style={styles.pressable} onPress={handlePress}>
        {children}
      </Pressable>

      {/* Visual Feedback Overlay */}
      {feedbackType && (
        <Animated.View
          pointerEvents="none"
          style={[styles.feedbackBadge, { opacity: feedbackFadeAnim, backgroundColor: colors.overlay }]}>
          <Ionicons
            name={
              feedbackType === 'volume'
                ? 'volume-medium-sharp'
                : feedbackType === 'brightness'
                ? 'sunny-sharp'
                : feedbackType === 'seek_fwd'
                ? 'reload-circle-sharp'
                : 'refresh-circle-sharp'
            }
            size={IconSizes.lg}
            color={colors.textPrimary}
          />
          <AppText variant="titleSmall">
            {feedbackType === 'volume'
              ? `Volume ${feedbackLevel}%`
              : feedbackType === 'brightness'
              ? `Brightness ${feedbackLevel}%`
              : feedbackType === 'seek_fwd'
              ? '+10s'
              : '-10s'}
          </AppText>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressable: {
    flex: 1,
  },
  feedbackBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.lg,
    zIndex: 20,
  },
});
