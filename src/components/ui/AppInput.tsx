import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, IconSizes, Spacing, Typography } from '@/theme/tokens';

export interface AppInputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  value,
  leftIcon,
  clearable = true,
  onClear,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: isFocused ? colors.borderFocus : colors.borderDefault,
        },
        containerStyle,
      ]}>
      {leftIcon || (
        <Ionicons
          name="search-sharp"
          size={IconSizes.sm}
          color={isFocused ? colors.primaryLight : colors.textMuted}
        />
      )}
      <TextInput
        value={value}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          Typography.bodyMedium,
          { color: colors.textPrimary },
          style,
        ]}
        {...props}
      />
      {clearable && value && value.length > 0 && (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityLabel="Clear input">
          <Ionicons
            name="close-circle-sharp"
            size={IconSizes.sm}
            color={colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
});
