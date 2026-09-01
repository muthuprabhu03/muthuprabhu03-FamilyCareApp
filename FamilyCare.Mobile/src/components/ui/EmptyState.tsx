import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from './PrimaryButton';
import { AppIcon } from './AppIcon';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  message,
  description,
  icon = 'doc.plaintext',
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceSubtle,
          borderColor: theme.cardBorder,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.backgroundSelected,
          },
        ]}
      >
        <AppIcon name={icon} tintColor={theme.primary} size={32} />
      </View>
      <ThemedText style={styles.title}>{message}</ThemedText>
      {description ? (
        <ThemedText themeColor="textSecondary" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
      {actionLabel && onAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          size="sm"
          icon="plus"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginVertical: Spacing.three,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.three,
    maxWidth: 260,
  },
  actionButton: {
    marginTop: Spacing.two,
    minWidth: 140,
  },
});

