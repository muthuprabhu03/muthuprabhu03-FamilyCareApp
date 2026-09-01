import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { reminderService } from '@/services/reminderService';
import { notificationService } from '@/services/notificationService';
import { Reminder } from '@/types/reminder';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { confirmAction } from '@/utils/alerts';
import { useTranslation } from '@/i18n';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
      const nextCompletedState = !reminder.isCompleted;
      await reminderService.updateReminder(reminder.id, {
        title: reminder.title,
        description: reminder.description,
        reminderAt: reminder.reminderAt,
        isCompleted: nextCompletedState,
      });

      if (nextCompletedState) {
        await notificationService.cancelNotification(`reminder-${reminder.id}`);
      } else {
        await notificationService.scheduleReminder({
          reminderId: reminder.id,
          title: reminder.title,
          description: reminder.description,
          targetDate: new Date(reminder.reminderAt),
        });
      }

      loadData();
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
  };

  const handleDelete = (reminder: Reminder) => {
    confirmAction(
      t('delete'),
      `Are you sure you want to delete "${reminder.title}"?`,
      async () => {
        try {
          await reminderService.deleteReminder(reminder.id);
          await notificationService.cancelNotification(`reminder-${reminder.id}`);
          loadData();
        } catch (e: any) {
          Alert.alert(t('error'), e.message);
        }
      },
      t('delete'),
      t('cancel')
    );
  };

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          activeOpacity={0.8}
        >
          <AppIcon name="chevron.left" tintColor={theme.text} size={20} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.two }}>
          <ThemedText type="default" style={styles.title}>
            {t('reminders')}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {pendingCount} pending {pendingCount === 1 ? 'task' : 'tasks'}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }, Shadows.glowPrimary]}
          onPress={() => router.push('/(app)/more/reminders/create' as any)}
          activeOpacity={0.85}
        >
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.content}>
        {isLoading ? (
          <View>
            <SkeletonCard style={{ marginBottom: Spacing.two }} />
            <SkeletonCard style={{ marginBottom: Spacing.two }} />
            <SkeletonCard style={{ marginBottom: Spacing.two }} />
          </View>
        ) : reminders.length === 0 ? (
          <EmptyState
            icon="bell.fill"
            message={t('noReminders') || 'No Tasks or Reminders'}
            description="Create notifications and reminders to keep your family organized."
            actionLabel={t('addReminderTitle') || '+ Add Reminder'}
            onAction={() => router.push('/(app)/more/reminders/create' as any)}
          />
        ) : (
          reminders.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                Shadows.soft,
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleComplete(item)}
                style={styles.checkBtn}
                activeOpacity={0.7}
              >
                <AppIcon
                  name={item.isCompleted ? 'checkmark.circle.fill' : 'circle'}
                  tintColor={item.isCompleted ? theme.success : theme.textSecondary}
                  size={24}
                />
              </TouchableOpacity>
              <View style={styles.cardInfo}>
                <ThemedText
                  type="default"
                  style={[
                    styles.titleText,
                    item.isCompleted && [styles.completedText, { color: theme.textSecondary }],
                  ]}
                >
                  {item.title}
                </ThemedText>
                {item.description ? (
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={{ marginBottom: 4 }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" themeColor="textSecondary" style={styles.dateText}>
                  {new Date(item.reminderAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <AppIcon name="xmark.circle.fill" tintColor={theme.danger} size={20} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: Spacing.four },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.lg,
    marginBottom: Spacing.two,
    borderWidth: 1,
  },
  checkBtn: { marginRight: Spacing.three },
  cardInfo: { flex: 1 },
  titleText: { fontWeight: '700', marginBottom: 2, fontSize: 15 },
  completedText: { textDecorationLine: 'line-through' },
  dateText: { fontSize: 12, marginTop: 2 },
  deleteBtn: {
    padding: Spacing.two,
    marginLeft: Spacing.two,
  },
});
