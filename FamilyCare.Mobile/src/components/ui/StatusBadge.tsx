import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export type StatusVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'pink' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'md',
  showDot = true,
  style,
}: StatusBadgeProps) {
  const theme = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.successBg, text: theme.success, dot: theme.success, border: 'rgba(16, 185, 129, 0.2)' };
      case 'danger':
        return { bg: theme.dangerBg, text: theme.danger, dot: theme.danger, border: 'rgba(239, 68, 68, 0.2)' };
      case 'warning':
        return { bg: theme.warningBg, text: theme.warning, dot: theme.warning, border: 'rgba(245, 158, 11, 0.2)' };
      case 'info':
      case 'purple':
        return { bg: theme.purpleBg, text: theme.purple, dot: theme.purple, border: 'rgba(139, 92, 246, 0.2)' };
      case 'pink':
        return { bg: theme.pinkBg, text: theme.pink, dot: theme.pink, border: 'rgba(236, 72, 153, 0.2)' };
      case 'neutral':
      default:
        return {
          bg: theme.backgroundSelected,
          text: theme.textSecondary,
          dot: theme.textSecondary,
          border: 'transparent',
        };
    }
  };

  const colors = getColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.dot,
              width: isSmall ? 5 : 6,
              height: isSmall ? 5 : 6,
              borderRadius: 3,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 5,
  },
  text: {
    letterSpacing: 0.2,
  },
});
