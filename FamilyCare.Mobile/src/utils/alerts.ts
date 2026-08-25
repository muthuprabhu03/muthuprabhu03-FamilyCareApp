import { Alert, Platform } from 'react-native';

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'Delete',
  cancelText: string = 'Cancel'
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm) {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result) {
        onConfirm();
      }
    } else {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
}
