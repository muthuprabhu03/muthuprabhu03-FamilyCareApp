import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { ThemedText } from '../themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from './AppIcon';

interface TrendChartWidgetProps {
  incomesTotal: number;
  expensesTotal: number;
  billsTotal: number;
}

export function TrendChartWidget({
  incomesTotal,
  expensesTotal,
  billsTotal,
}: TrendChartWidgetProps) {
  const theme = useTheme();
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');
  const screenWidth = Dimensions.get('window').width;
  const contentWidth = Math.min(screenWidth - Spacing.four * 2 - 32, 500);

  const maxValue = Math.max(incomesTotal, expensesTotal, billsTotal, 1);

  // Bar proportions (15% min height for visibility)
  const incomeHeight = Math.max(15, Math.round((incomesTotal / maxValue) * 100));
  const expenseHeight = Math.max(15, Math.round((expensesTotal / maxValue) * 100));
  const billHeight = Math.max(15, Math.round((billsTotal / maxValue) * 100));

  // Line Chart SVG coordinates calculation
  const svgWidth = contentWidth - 10;
  const svgHeight = 140;
  const paddingX = 30;
  const paddingY = 20;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  const points = [
    { label: 'In', value: incomesTotal, x: paddingX, y: svgHeight - paddingY - (incomesTotal / maxValue) * usableHeight },
    { label: 'Out', value: expensesTotal, x: paddingX + usableWidth * 0.5, y: svgHeight - paddingY - (expensesTotal / maxValue) * usableHeight },
    { label: 'Bills', value: billsTotal, x: paddingX + usableWidth, y: svgHeight - paddingY - (billsTotal / maxValue) * usableHeight },
  ];

  // Generate smooth cubic bezier SVG curve
  const curvePath = `M ${points[0].x} ${points[0].y} Q ${(points[0].x + points[1].x) / 2} ${points[0].y - 10}, ${points[1].x} ${points[1].y} T ${points[2].x} ${points[2].y}`;
  const areaPath = `${curvePath} L ${points[2].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

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
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>CASH FLOW VISUALIZER</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Comparative financial totals
          </ThemedText>
        </View>

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              chartMode === 'bar' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setChartMode('bar')}
            activeOpacity={0.8}
          >
            <AppIcon
              name="chart.bar.fill"
              tintColor={chartMode === 'bar' ? '#fff' : theme.textSecondary}
              size={13}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              chartMode === 'line' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setChartMode('line')}
            activeOpacity={0.8}
          >
            <AppIcon
              name="chart.line.uptrend.xyaxis"
              tintColor={chartMode === 'line' ? '#fff' : theme.textSecondary}
              size={13}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart Visual Presentation */}
      {chartMode === 'bar' ? (
        <View style={styles.barsContainer}>
          {/* Income Bar Column */}
          <View style={styles.barColumn}>
            <ThemedText style={[styles.barAmount, { color: theme.success }]}>
              ${incomesTotal.toFixed(0)}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${incomeHeight}%`,
                    backgroundColor: theme.success,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.barLabel}>Incomes</ThemedText>
          </View>

          {/* Expense Bar Column */}
          <View style={styles.barColumn}>
            <ThemedText style={[styles.barAmount, { color: theme.danger }]}>
              ${expensesTotal.toFixed(0)}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${expenseHeight}%`,
                    backgroundColor: theme.danger,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.barLabel}>Expenses</ThemedText>
          </View>

          {/* Bills Bar Column */}
          <View style={styles.barColumn}>
            <ThemedText style={[styles.barAmount, { color: theme.warning }]}>
              ${billsTotal.toFixed(0)}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${billHeight}%`,
                    backgroundColor: theme.warning,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.barLabel}>Bills</ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.lineChartWrapper}>
          <Svg width={svgWidth} height={svgHeight}>
            <Defs>
              <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.primary} stopOpacity="0.35" />
                <Stop offset="1" stopColor={theme.primary} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Baseline */}
            <Line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke={theme.cardBorder}
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Area fill */}
            <Path d={areaPath} fill="url(#lineGrad)" />

            {/* Curve line */}
            <Path
              d={curvePath}
              stroke={theme.primary}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Data Point Dots & Labels */}
            {points.map((p, idx) => (
              <React.Fragment key={idx}>
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#ffffff"
                  stroke={idx === 0 ? theme.success : idx === 1 ? theme.danger : theme.warning}
                  strokeWidth="2.5"
                />
                <SvgText
                  x={p.x}
                  y={p.y - 10}
                  fontSize="10"
                  fontWeight="bold"
                  fill={theme.text}
                  textAnchor="middle"
                >
                  ${p.value.toFixed(0)}
                </SvgText>
                <SvgText
                  x={p.x}
                  y={svgHeight - 4}
                  fontSize="11"
                  fill={theme.textSecondary}
                  textAnchor="middle"
                >
                  {p.label}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  barColumn: {
    alignItems: 'center',
    width: 70,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barAmount: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  barTrack: {
    width: 24,
    height: 95,
    borderRadius: Radius.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.md,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  lineChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
