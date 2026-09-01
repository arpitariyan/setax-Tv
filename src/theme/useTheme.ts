import { useColorScheme } from 'react-native';
import { Colors } from './tokens';

export function useTheme() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'light' ? Colors.light : Colors.dark;

  return {
    colors: theme,
    isDark: colorScheme !== 'light',
  };
}
