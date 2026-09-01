import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import { ThemedText } from '../themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from './AppIcon';

interface DonutSlice {
  name: string;
  amount: number;
  color: string;
}

interface DonutChartWidgetProps {
  incomesTotal: number;
  expensesTotal: number;
  billsTotal: number;
  netBalance: number;
}

export function DonutChartWidget({
  incomesTotal,
  expensesTotal,
  billsTotal,
  netBalance,
}: DonutChartWidgetProps) {
  const theme = useTheme();

  const total = incomesTotal + expensesTotal + billsTotal;
  const hasData = total > 0;

  const slices: DonutSlice[] = [
    { name: 'Income', amount: incomesTotal, color: theme.success },
    { name: 'Expense', amount: expensesTotal, color: theme.danger },
    { name: 'Bills', amount: billsTotal, color: theme.warning },
  ];

  // SVG dimensions
  const size = 150;
  const radius = 60;
  const innerRadius = 42;
  const center = size / 2;

  // Arc path generator
  const getCoordinatesForPercent = (percent: number) => {
    const x = center + radius * Math.cos(2 * Math.PI * percent);
    const y = center + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const getInnerCoordinatesForPercent = (percent: number) => {
    const x = center + innerRadius * Math.cos(2 * Math.PI * percent);
    const y = center + innerRadius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  let cumulativePercent = 0;

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
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>EXPENSE & CASHFLOW BREAKDOWN</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Net balance: ${netBalance.toFixed(2)}
          </ThemedText>
        </View>
        <View
          style={[
            styles.balanceBadge,
            { backgroundColor: netBalance >= 0 ? theme.successBg : theme.dangerBg },
          ]}
        >
          <ThemedText
            style={[
              styles.balanceBadgeText,
              { color: netBalance >= 0 ? theme.success : theme.danger },
            ]}
          >
            {netBalance >= 0 ? 'Surplus' : 'Deficit'}
          </ThemedText>
        </View>
      </View>

      {hasData ? (
        <View style={styles.chartRow}>
          {/* Pure SVG Donut Ring */}
          <View style={styles.donutWrapper}>
            <Svg width={size} height={size}>
              <G transform={`rotate(-90 ${center} ${center})`}>
                {slices.map((slice, index) => {
                  if (slice.amount <= 0) return null;
                  const slicePercent = slice.amount / total;
                  const startPercent = cumulativePercent;
                  cumulativePercent += slicePercent;
                  const endPercent = cumulativePercent;

                  const [startX, startY] = getCoordinatesForPercent(startPercent);
                  const [endX, endY] = getCoordinatesForPercent(endPercent);
                  const [innerStartX, innerStartY] = getInnerCoordinatesForPercent(startPercent);
                  const [innerEndX, innerEndY] = getInnerCoordinatesForPercent(endPercent);

                  const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

                  // Full circle edge case
                  if (slicePercent >= 0.999) {
                    return (
                      <Circle
                        key={index}
                        cx={center}
                        cy={center}
                        r={(radius + innerRadius) / 2}
                        stroke={slice.color}
                        strokeWidth={radius - innerRadius}
                        fill="none"
                      />
                    );
                  }

                  const pathData = [
                    `M ${startX} ${startY}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    `L ${innerEndX} ${innerEndY}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
                    'Z',
                  ].join(' ');

                  return (
                    <Path
                      key={index}
                      d={pathData}
                      fill={slice.color}
                    />
                  );
                })}
              </G>
            </Svg>

            {/* Centered Net Amount */}
            <View style={styles.donutCenter}>
              <ThemedText style={styles.donutCenterLabel}>TOTAL</ThemedText>
              <ThemedText style={styles.donutCenterAmount}>
                ${total.toFixed(0)}
              </ThemedText>
            </View>
          </View>

          {/* Legend Items */}
          <View style={styles.legendColumn}>
            {slices.map((slice, index) => {
              const pct = total > 0 ? Math.round((slice.amount / total) * 100) : 0;
              return (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.legendName}>{slice.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      ${slice.amount.toFixed(2)} ({pct}%)
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.noDataBox}>
          <AppIcon name="chart.pie" tintColor={theme.textSecondary} size={36} />
          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 8 }}>
            No financial records to chart yet
          </ThemedText>
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
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  title: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  balanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  balanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  donutCenterAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  legendColumn: {
    flex: 1,
    paddingLeft: Spacing.three,
    justifyContent: 'center',
    gap: 8,
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
  legendName: {
    fontSize: 12,
    fontWeight: '700',
  },
  noDataBox: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
});
