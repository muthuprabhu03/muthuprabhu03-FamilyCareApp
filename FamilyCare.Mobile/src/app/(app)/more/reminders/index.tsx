import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { reminderService } from '@/services/reminderService';
import { Reminder } from '@/types/reminder';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';

export default function RemindersScreen() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = async (reminder: Reminder) => {
    try {
      await reminderService.updateReminder(reminder.id, {
        title: reminder.title,
        description: reminder.description,
        reminderAt: reminder.reminderAt,
        isCompleted: !reminder.isCompleted,
      });
      loadData();
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <AppIcon name="chevron.left" tintColor={theme.text} size={24} />
        </TouchableOpacity>
        <ThemedText type="default" style={styles.title}>{t('reminders')}</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/more/reminders/create' as any)}
        >
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        {reminders.length === 0 ? (
          <EmptyState 
            message={t('noReminders')} 
            actionLabel={t('addReminderTitle')} 
            onAction={() => router.push('/(app)/more/reminders/create' as any)} 
          />
        ) : (
          reminders.map((item) => (
            <ThemedView key={item.id} style={[styles.card, { backgroundColor: theme.background }]}>
              <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.checkBtn}>
                <AppIcon 
                  name={item.isCompleted ? 'checkmark.circle.fill' : 'circle'} 
                  tintColor={item.isCompleted ? '#10b981' : theme.textSecondary} 
                  size={26} 
                />
              </TouchableOpacity>
              <View style={styles.cardInfo}>
                <ThemedText type="default" style={[styles.titleText, item.isCompleted && styles.completedText]}>
                  {item.title}
                </ThemedText>
                {item.description ? (
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: 2 }}>
                    {item.description}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(item.reminderAt).toLocaleString()}
                </ThemedText>
              </View>
            </ThemedView>
          ))
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  addButton: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: Spacing.three, backgroundColor: 'transparent' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  checkBtn: { marginRight: Spacing.three },
  cardInfo: { flex: 1, backgroundColor: 'transparent' },
  titleText: { fontWeight: '600', marginBottom: 2, fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' },
});
