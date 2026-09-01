import { Platform } from 'react-native';
import { Colors as ThemeColors, Spacing as ThemeSpacing } from '@/theme/tokens';

export const Colors = ThemeColors;
export const Spacing = ThemeSpacing;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
