import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from './AppIcon';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export function FormInput({
  label,
  error,
  required,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: FormInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="small" style={[styles.label, { color: isFocused ? theme.primary : theme.text }]}>
          {label}
        </ThemedText>
        {required && <ThemedText style={{ color: theme.danger, marginLeft: 3 }}>*</ThemedText>}
      </View>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.inputBg,
            borderColor: error
              ? theme.danger
              : isFocused
              ? theme.primary
              : theme.inputBorder,
          },
          isFocused && {
            borderWidth: 1.5,
            ...Shadows.soft,
          },
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            <AppIcon
              name={leftIcon}
              tintColor={isFocused ? theme.primary : theme.textSecondary}
              size={18}
            />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
            style,
          ]}
          placeholderTextColor={theme.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            activeOpacity={0.7}
          >
            <AppIcon
              name={rightIcon}
              tintColor={theme.textSecondary}
              size={18}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <AppIcon name="exclamationmark.triangle.fill" tintColor={theme.danger} size={14} />
          <ThemedText type="small" style={[styles.errorText, { color: theme.danger }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
  leftIcon: {
    marginRight: Spacing.two,
  },
  rightIcon: {
    padding: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

