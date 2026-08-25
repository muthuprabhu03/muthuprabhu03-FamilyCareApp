import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useTheme() {
  try {
    const { theme } = useAppTheme();
    if (theme) return theme;
  } catch (e) {}

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  return Colors[theme];
}
