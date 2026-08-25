import { StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';
import { Spacing } from '@/constants/theme';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ message, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <PrimaryButton 
          title={actionLabel} 
          onPress={onAction} 
          style={styles.actionButton} 
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: Spacing.four,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  actionButton: {
    paddingHorizontal: Spacing.five,
    height: 44,
  }
});
