import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { 
            borderColor: error ? '#ef4444' : theme.backgroundSelected,
            color: theme.text,
            backgroundColor: theme.backgroundElement,
          },
          style
        ]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {error ? <ThemedText type="small" style={styles.errorText}>{error}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  label: {
    marginBottom: Spacing.one,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 4,
  }
});
