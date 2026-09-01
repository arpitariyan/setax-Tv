import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Typography } from '@/theme/tokens';

export type TextVariant =
  | 'display'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'badge';

export type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'bodyMedium',
  color = 'primary',
  align = 'auto',
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getColor = () => {
    switch (color) {
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'inverse':
        return colors.textInverse;
      case 'accent':
        return colors.primaryLight;
      case 'primary':
      default:
        return colors.textPrimary;
    }
  };

  return (
    <Text
      style={[
        Typography[variant],
        { color: getColor(), textAlign: align },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};
