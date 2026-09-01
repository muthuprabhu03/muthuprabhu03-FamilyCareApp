import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { financeService } from '@/services/financeService';
import { Bill, Expense, Income } from '@/types/finance';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SkeletonCard, SkeletonBox } from '@/components/ui/SkeletonLoader';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendChartWidget } from '@/components/ui/TrendChartWidget';
import { DonutChartWidget } from '@/components/ui/DonutChartWidget';

type FilterTab = 'all' | 'income' | 'expense' | 'bill';

export default function FinanceScreen() {
  const { t } = useTranslation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [visualMode, setVisualMode] = useState<'pie' | 'trend'>('pie');
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
      const [b, e, i] = await Promise.all([
        financeService.getBills(),
        financeService.getExpenses(),
        financeService.getIncomes(),
      ]);
      setBills(b);
      setExpenses(e);
      setIncomes(i);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalBills = bills.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const renderTransactionItem = (item: any, type: 'bill' | 'expense' | 'income') => {
    const isIncome = type === 'income';
    const isExpense = type === 'expense';

    const getIconName = () => {
      if (isIncome) return 'arrow.down.circle.fill';
      if (isExpense) return 'cart.fill';
      return 'doc.plaintext.fill';
    };

    const getIconColor = () => {
      if (isIncome) return theme.success;
      if (isExpense) return theme.danger;
      return theme.warning;
    };

    const getIconBg = () => {
      if (isIncome) return theme.successBg;
      if (isExpense) return theme.dangerBg;
      return theme.warningBg;
    };

    const title = type === 'bill' ? item.name : isExpense ? item.category : item.source;
    const dateStr =
      type === 'bill'
        ? `${t('dueDate') || 'Due'}: ${new Date(item.dueDate).toLocaleDateString()}`
        : new Date(item.date).toLocaleDateString();

    return (
      <TouchableOpacity
        key={`${type}-${item.id}`}
        onPress={() => router.push(`/(app)/finance/${type}/${item.id}` as any)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
            <AppIcon name={getIconName()} tintColor={getIconColor()} size={22} />
          </View>
          <View style={styles.cardInfo}>
            <ThemedText type="default" style={styles.itemName}>
              {title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {dateStr}
            </ThemedText>
          </View>
          <View style={styles.amountContainer}>
            <ThemedText
              style={[
                styles.amount,
                { color: isIncome ? theme.success : isExpense ? theme.danger : theme.text },
              ]}
            >
              {isIncome ? '+' : '-'}${Number(item.amount || 0).toFixed(2)}
            </ThemedText>
            <StatusBadge
              label={type.toUpperCase()}
              variant={isIncome ? 'success' : isExpense ? 'danger' : 'warning'}
              size="sm"
              showDot={false}
              style={{ alignSelf: 'flex-end', marginTop: 2 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: incomes.length + expenses.length + bills.length },
    { key: 'income', label: t('incomes') || 'Income', count: incomes.length },
    { key: 'expense', label: t('expenses') || 'Expenses', count: expenses.length },
    { key: 'bill', label: t('bills') || 'Bills', count: bills.length },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="default" style={styles.title}>
            {t('financeOverview')}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Track family cashflow, expenses & bills
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }, Shadows.glowPrimary]}
          onPress={() => router.push('/(app)/finance/create' as any)}
          activeOpacity={0.85}
        >
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      {/* Chart View Selector & Chart Cards */}
      <View style={styles.chartToggleRow}>
        <TouchableOpacity
          style={[
            styles.chartModeBtn,
            {
              backgroundColor: visualMode === 'pie' ? theme.primary : theme.card,
              borderColor: visualMode === 'pie' ? theme.primary : theme.cardBorder,
            },
          ]}
          onPress={() => setVisualMode('pie')}
          activeOpacity={0.8}
        >
          <AppIcon
            name="chart.pie.fill"
            tintColor={visualMode === 'pie' ? '#fff' : theme.textSecondary}
            size={14}
          />
          <ThemedText
            style={[
              styles.chartModeBtnText,
              { color: visualMode === 'pie' ? '#fff' : theme.text },
            ]}
          >
            Category Share
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chartModeBtn,
            {
              backgroundColor: visualMode === 'trend' ? theme.primary : theme.card,
              borderColor: visualMode === 'trend' ? theme.primary : theme.cardBorder,
            },
          ]}
          onPress={() => setVisualMode('trend')}
          activeOpacity={0.8}
        >
          <AppIcon
            name="chart.bar.fill"
            tintColor={visualMode === 'trend' ? '#fff' : theme.textSecondary}
            size={14}
          />
          <ThemedText
            style={[
              styles.chartModeBtnText,
              { color: visualMode === 'trend' ? '#fff' : theme.text },
            ]}
          >
            Cash Flow Bars
          </ThemedText>
        </TouchableOpacity>
      </View>

      {visualMode === 'pie' ? (
        <View style={{ marginHorizontal: Spacing.four }}>
          <DonutChartWidget
            incomesTotal={totalIncome}
            expensesTotal={totalExpense}
            billsTotal={totalBills}
            netBalance={netBalance}
          />
        </View>
      ) : (
        <View style={{ marginHorizontal: Spacing.four }}>
          <TrendChartWidget
            incomesTotal={totalIncome}
            expensesTotal={totalExpense}
            billsTotal={totalBills}
          />
        </View>
      )}

      {/* Segmented Filter Pills */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  },
                  isSelected && Shadows.glowPrimary,
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.tabPillText,
                    {
                      color: isSelected ? '#ffffff' : theme.text,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </ThemedText>
                <View
                  style={[
                    styles.tabCountBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.25)'
                        : theme.backgroundSelected,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.tabCountText,
                      { color: isSelected ? '#ffffff' : theme.textSecondary },
                    ]}
                  >
                    {tab.count}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Transaction List Feed */}
      <View style={styles.content}>
        {isLoading ? (
          <View>
            <SkeletonCard style={{ marginBottom: Spacing.two }} />
            <SkeletonCard style={{ marginBottom: Spacing.two }} />
            <SkeletonCard style={{ marginBottom: Spacing.two }} />
          </View>
        ) : (
          <View>
            {(activeTab === 'all' || activeTab === 'income') && incomes.length > 0 && (
              <View style={styles.groupSection}>
                {activeTab === 'all' && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.groupTitle}>
                    INCOME ({incomes.length})
                  </ThemedText>
                )}
                {incomes.map((item) => renderTransactionItem(item, 'income'))}
              </View>
            )}

            {(activeTab === 'all' || activeTab === 'expense') && expenses.length > 0 && (
              <View style={styles.groupSection}>
                {activeTab === 'all' && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.groupTitle}>
                    EXPENSES ({expenses.length})
                  </ThemedText>
                )}
                {expenses.map((item) => renderTransactionItem(item, 'expense'))}
              </View>
            )}

            {(activeTab === 'all' || activeTab === 'bill') && bills.length > 0 && (
              <View style={styles.groupSection}>
                {activeTab === 'all' && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.groupTitle}>
                    BILLS ({bills.length})
                  </ThemedText>
                )}
                {bills.map((item) => renderTransactionItem(item, 'bill'))}
              </View>
            )}

            {/* Empty State when no items exist for current filter */}
            {((activeTab === 'all' && incomes.length === 0 && expenses.length === 0 && bills.length === 0) ||
              (activeTab === 'income' && incomes.length === 0) ||
              (activeTab === 'expense' && expenses.length === 0) ||
              (activeTab === 'bill' && bills.length === 0)) && (
              <EmptyState
                icon="dollarsign.circle.fill"
                message="No Transactions Found"
                description="Tap below to record an income, expense, or bill."
                actionLabel={t('add') || 'Add Transaction'}
                onAction={() => router.push('/(app)/finance/create' as any)}
              />
            )}
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  balanceLabel: {
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 11,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  noChartBox: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  tabsContainer: {
    marginBottom: Spacing.three,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.four,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 13,
  },
  tabCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.four,
  },
  groupSection: {
    marginBottom: Spacing.four,
  },
  groupTitle: {
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 11,
    marginBottom: Spacing.two,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    marginBottom: Spacing.two,
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  cardInfo: { flex: 1 },
  itemName: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  chartToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    gap: 8,
  },
  chartModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 6,
  },
  chartModeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
