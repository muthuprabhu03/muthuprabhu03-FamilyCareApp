import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Shadows, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'subtle' | 'accent' | 'flat';
  activeOpacity?: number;
}

export function GlassCard({
  children,
  style,
  onPress,
  variant = 'elevated',
  activeOpacity = 0.88,
}: GlassCardProps) {
  const theme = useTheme();

  const getBackground = () => {
    switch (variant) {
      case 'subtle':
        return theme.surfaceSubtle;
      case 'accent':
        return theme.primary;
      case 'flat':
        return theme.card;
      case 'elevated':
      default:
        return theme.card;
    }
  };

  const cardStyle = [
    styles.base,
    {
      backgroundColor: getBackground(),
      borderColor: variant === 'accent' ? 'transparent' : theme.cardBorder,
    },
    variant === 'elevated' && Shadows.soft,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
