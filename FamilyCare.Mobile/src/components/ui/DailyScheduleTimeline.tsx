import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from './AppIcon';

interface TimeSlot {
  id: string;
  name: string;
  timeRange: string;
  icon: string;
  completed: boolean;
  medicinesCount: number;
}

interface DailyScheduleTimelineProps {
  activeMedicinesCount: number;
}

export function DailyScheduleTimeline({
  activeMedicinesCount,
}: DailyScheduleTimelineProps) {
  const theme = useTheme();

  const [slots, setSlots] = useState<TimeSlot[]>([
    {
      id: 'morning',
      name: 'Morning',
      timeRange: '8:00 AM',
      icon: 'sun.max.fill',
      completed: true,
      medicinesCount: Math.min(activeMedicinesCount, 2),
    },
    {
      id: 'afternoon',
      name: 'Afternoon',
      timeRange: '1:00 PM',
      icon: 'sun.horizon.fill',
      completed: false,
      medicinesCount: Math.min(activeMedicinesCount, 1),
    },
    {
      id: 'evening',
      name: 'Evening',
      timeRange: '6:30 PM',
      icon: 'sunset.fill',
      completed: false,
      medicinesCount: Math.min(activeMedicinesCount, 2),
    },
    {
      id: 'night',
      name: 'Night',
      timeRange: '10:00 PM',
      icon: 'moon.stars.fill',
      completed: false,
      medicinesCount: Math.min(activeMedicinesCount, 1),
    },
  ]);

  const toggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, completed: !slot.completed } : slot
      )
    );
  };

  const completedSlots = slots.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedSlots / slots.length) * 100);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
        Shadows.soft,
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <ThemedText style={styles.title}>DAILY MEDICATION TIMELINE</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {completedSlots} of {slots.length} time slots completed ({progressPercent}%)
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.pinkBg }]}>
          <AppIcon name="cross.case.fill" tintColor={theme.pink} size={14} />
          <ThemedText style={[styles.badgeText, { color: theme.pink }]}>
            {progressPercent}% Today
          </ThemedText>
        </View>
      </View>

      {/* Graphical Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: theme.pink,
            },
          ]}
        />
      </View>

      {/* 4 Time Slots Grid */}
      <View style={styles.slotsRow}>
        {slots.map((slot) => {
          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotCard,
                {
                  backgroundColor: slot.completed
                    ? theme.pinkBg
                    : theme.backgroundElement,
                  borderColor: slot.completed ? theme.pink : theme.cardBorder,
                },
              ]}
              onPress={() => toggleSlot(slot.id)}
              activeOpacity={0.8}
            >
              <View style={styles.slotTop}>
                <AppIcon
                  name={slot.icon}
                  tintColor={slot.completed ? theme.pink : theme.textSecondary}
                  size={18}
                />
                <AppIcon
                  name={slot.completed ? 'checkmark.circle.fill' : 'circle'}
                  tintColor={slot.completed ? theme.pink : theme.textSecondary}
                  size={16}
                />
              </View>

              <ThemedText style={styles.slotName}>{slot.name}</ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.slotTime}
              >
                {slot.timeRange}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginVertical: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  title: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  slotCard: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  slotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  slotName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  slotTime: {
    fontSize: 10,
    fontWeight: '500',
  },
});
