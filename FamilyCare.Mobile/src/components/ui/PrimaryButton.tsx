import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from './AppIcon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export function PrimaryButton({
  title,
  isLoading,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  style,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const theme = useTheme();

  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: theme.backgroundSelected,
          text: theme.text,
          border: 'transparent',
          iconColor: theme.text,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.primary,
          border: theme.primary,
          iconColor: theme.primary,
        };
      case 'danger':
        return {
          bg: theme.danger,
          text: '#ffffff',
          border: 'transparent',
          iconColor: '#ffffff',
        };
      case 'success':
        return {
          bg: theme.success,
          text: '#ffffff',
          border: 'transparent',
          iconColor: '#ffffff',
        };
      case 'primary':
      default:
        return {
          bg: theme.primary,
          text: '#ffffff',
          border: 'transparent',
          iconColor: '#ffffff',
        };
    }
  };

  const btnColors = getButtonStyles();

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 56;
      case 'md':
      default:
        return 48;
    }
  };

  const isPrimary = variant === 'primary' || variant === 'danger' || variant === 'success';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[
        styles.button,
        {
          height: getHeight(),
          backgroundColor: btnColors.bg,
          borderColor: btnColors.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        isPrimary && Shadows.soft,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={btnColors.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.leftIcon}>
              <AppIcon name={icon} tintColor={btnColors.iconColor} size={size === 'sm' ? 16 : 18} />
            </View>
          )}
          <ThemedText
            style={[
              styles.text,
              {
                color: btnColors.text,
                fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
              },
            ]}
          >
            {title}
          </ThemedText>
          {icon && iconPosition === 'right' && (
            <View style={styles.rightIcon}>
              <AppIcon name={icon} tintColor={btnColors.iconColor} size={size === 'sm' ? 16 : 18} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginVertical: Spacing.two,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

