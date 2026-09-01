import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { ThemedText } from '../themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from './AppIcon';

interface ActivityRingWidgetProps {
  taskCompletionRate: number; // 0 to 1
  budgetHealthRate: number; // 0 to 1
  medicineAdherenceRate: number; // 0 to 1
}

export function ActivityRingWidget({
  taskCompletionRate,
  budgetHealthRate,
  medicineAdherenceRate,
}: ActivityRingWidgetProps) {
  const theme = useTheme();

  // Ring dimension configuration
  const size = 130;
  const strokeWidth = 10;
  const center = size / 2;

  // Concentric ring radii
  const rTasks = center - strokeWidth / 2 - 2; // Outer ring
  const rBudget = rTasks - strokeWidth - 4; // Middle ring
  const rHealth = rBudget - strokeWidth - 4; // Inner ring

  // Circumferences
  const cTasks = 2 * Math.PI * rTasks;
  const cBudget = 2 * Math.PI * rBudget;
  const cHealth = 2 * Math.PI * rHealth;

  // Clamped progress values (0.01 to 1.0)
  const pTasks = Math.max(0.02, Math.min(1, taskCompletionRate));
  const pBudget = Math.max(0.02, Math.min(1, budgetHealthRate));
  const pHealth = Math.max(0.02, Math.min(1, medicineAdherenceRate));

  // Dash offsets
  const offsetTasks = cTasks * (1 - pTasks);
  const offsetBudget = cBudget * (1 - pBudget);
  const offsetHealth = cHealth * (1 - pHealth);

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
      <View style={styles.headerRow}>
        <View>
          <ThemedText style={styles.title}>FAMILY ACTIVITY RINGS</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Daily wellness & goal progress
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.purpleBg }]}>
          <AppIcon name="sparkles" tintColor={theme.primary} size={14} />
          <ThemedText style={[styles.badgeText, { color: theme.primary }]}>Active</ThemedText>
        </View>
      </View>

      <View style={styles.chartRow}>
        {/* Pure SVG Apple-style Concentric Activity Rings */}
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size}>
            {/* Outer Ring: Tasks (Amber) */}
            <Circle
              cx={center}
              cy={center}
              r={rTasks}
              stroke="rgba(245, 158, 11, 0.18)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={rTasks}
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={cTasks}
              strokeDashoffset={offsetTasks}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />

            {/* Middle Ring: Budget (Emerald) */}
            <Circle
              cx={center}
              cy={center}
              r={rBudget}
              stroke="rgba(16, 185, 129, 0.18)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={rBudget}
              stroke="#10b981"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={cBudget}
              strokeDashoffset={offsetBudget}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />

            {/* Inner Ring: Health (Pink) */}
            <Circle
              cx={center}
              cy={center}
              r={rHealth}
              stroke="rgba(236, 72, 153, 0.18)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={rHealth}
              stroke="#ec4899"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={cHealth}
              strokeDashoffset={offsetHealth}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
        </View>

        {/* Legend */}
        <View style={styles.legendColumn}>
          {/* Tasks Ring */}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.legendLabel}>Tasks Completed</ThemedText>
              <ThemedText style={[styles.legendValue, { color: '#f59e0b' }]}>
                {Math.round(taskCompletionRate * 100)}%
              </ThemedText>
            </View>
          </View>

          {/* Budget Ring */}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.legendLabel}>Budget Saved</ThemedText>
              <ThemedText style={[styles.legendValue, { color: '#10b981' }]}>
                {Math.round(budgetHealthRate * 100)}%
              </ThemedText>
            </View>
          </View>

          {/* Health Ring */}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.legendLabel}>Health & Meds</ThemedText>
              <ThemedText style={[styles.legendValue, { color: '#ec4899' }]}>
                {Math.round(medicineAdherenceRate * 100)}%
              </ThemedText>
            </View>
          </View>
        </View>
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
    marginBottom: Spacing.three,
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
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartWrapper: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendColumn: {
    flex: 1,
    paddingLeft: Spacing.four,
    justifyContent: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});
