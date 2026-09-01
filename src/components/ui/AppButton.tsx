import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { BorderRadius, Spacing } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let bg = colors.primary;
    let border = 'transparent';

    if (variant === 'secondary') {
      bg = colors.surfaceRaised;
    } else if (variant === 'outline') {
      bg = 'transparent';
      border = colors.borderDefault;
    } else if (variant === 'ghost') {
      bg = 'transparent';
    } else if (variant === 'danger') {
      bg = colors.statusUnavailable;
    }

    if (pressed && !disabled && !loading) {
      if (variant === 'primary') bg = colors.primaryActive;
      else if (variant === 'secondary') bg = colors.surfaceOverlay;
      else if (variant === 'outline' || variant === 'ghost') bg = colors.surfaceRaised;
    }

    if (disabled) {
      bg = colors.surfaceRaised;
      border = 'transparent';
    }

    let paddingVertical = Spacing.md;
    let paddingHorizontal = Spacing.lg;

    if (size === 'sm') {
      paddingVertical = Spacing.sm;
      paddingHorizontal = Spacing.md;
    } else if (size === 'lg') {
      paddingVertical = Spacing.lg;
      paddingHorizontal = Spacing.xl;
    }

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: variant === 'outline' ? 1 : 0,
      paddingVertical,
      paddingHorizontal,
      borderRadius: BorderRadius.md,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextColor = (): 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' => {
    if (disabled) return 'muted';
    if (variant === 'primary' || variant === 'danger') return 'inverse';
    if (variant === 'outline' || variant === 'ghost') return 'primary';
    return 'primary';
  };

  const getTextVariant = () => {
    if (size === 'sm') return 'bodySmall';
    if (size === 'lg') return 'titleSmall';
    return 'bodyMedium';
  };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [styles.base, getContainerStyle(pressed), style]}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor() === 'inverse' ? colors.textInverse : colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <AppText
            variant={getTextVariant()}
            color={getTextColor()}
            style={styles.text}>
            {title}
          </AppText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 44, // Touch target minimum 44px
  },
  text: {
    fontWeight: '600',
  },
});
