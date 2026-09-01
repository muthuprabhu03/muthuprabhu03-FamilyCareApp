import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Text, TouchableOpacity } from 'react-native';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { AppIcon } from './AppIcon';
import { useTheme } from '@/hooks/use-theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

export function ToastNotification({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark.circle.fill', color: theme.success, bg: theme.successBg };
      case 'error':
        return { name: 'exclamationmark.triangle.fill', color: theme.danger, bg: theme.dangerBg };
      case 'warning':
        return { name: 'exclamationmark.triangle.fill', color: theme.warning, bg: theme.warningBg };
      case 'info':
      default:
        return { name: 'info.circle.fill', color: theme.primary, bg: theme.purpleBg };
    }
  };

  const iconInfo = getIcon();

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          Shadows.strong,
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
          <AppIcon name={iconInfo.name} tintColor={iconInfo.color} size={18} />
        </View>
        <Text style={[styles.messageText, { color: theme.text }]} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeBtn}
        >
          <AppIcon name="xmark" tintColor={theme.textSecondary} size={14} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 50,
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
    marginLeft: Spacing.two,
  },
});
