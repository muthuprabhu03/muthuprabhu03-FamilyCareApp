import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { AppIcon } from '@/components/ui/AppIcon';
import { Spacing } from '@/constants/theme';

export function ThemeSwitcherButton() {
  const { isDark, setThemeMode } = useAppTheme();

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
        },
      ]}
    >
      <AppIcon
        name={isDark ? 'sun.max.fill' : 'moon.fill'}
        tintColor={isDark ? '#fbbf24' : '#667eea'}
        size={20}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
});
