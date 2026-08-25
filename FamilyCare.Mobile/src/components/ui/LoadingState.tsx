import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '../themed-view';

export function LoadingState() {
  return (
    <ThemedView style={styles.container} type="backgroundElement">
      <ActivityIndicator size="large" color="#667eea" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
