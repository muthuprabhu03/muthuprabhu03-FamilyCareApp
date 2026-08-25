import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { financeService } from '@/services/financeService';
import { Bill, Expense, Income } from '@/types/finance';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LoadingState } from '@/components/ui/LoadingState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { useTranslation } from '@/i18n';

export default function FinanceScreen() {
  const { t } = useTranslation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
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

  if (isLoading) return <LoadingState />;

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = bills.reduce((sum, item) => sum + item.amount, 0);

  const chartData = [
    { name: t('incomes'), amount: totalIncome, color: '#10b981', legendFontColor: theme.text, legendFontSize: 13 },
    { name: t('expenses'), amount: totalExpense, color: '#ef4444', legendFontColor: theme.text, legendFontSize: 13 },
    { name: t('bills'), amount: totalBills, color: '#f59e0b', legendFontColor: theme.text, legendFontSize: 13 },
  ];

  const renderList = (title: string, data: any[], type: 'bill' | 'expense' | 'income') => (
    <View style={styles.section}>
      <ThemedText type="default" style={styles.sectionTitle}>{title}</ThemedText>
      {data.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {title} {t('noFamilyMembers').toLowerCase()}
        </ThemedText>
      ) : (
        data.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(`/(app)/finance/${type}/${item.id}` as any)}
          >
            <ThemedView style={[styles.card, { backgroundColor: theme.background }]}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      type === 'income'
                        ? '#dcfce7'
                        : type === 'expense'
                        ? '#fee2e2'
                        : '#fef3c7',
                  },
                ]}
              >
                <AppIcon
                  name={
                    type === 'income'
                      ? 'arrow.down.circle.fill'
                      : type === 'expense'
                      ? 'cart.fill'
                      : 'doc.plaintext.fill'
                  }
                  tintColor={
                    type === 'income'
                      ? '#16a34a'
                      : type === 'expense'
                      ? '#dc2626'
                      : '#d97706'
                  }
                  size={24}
                />
              </View>
              <View style={styles.cardInfo}>
                <ThemedText type="default" style={styles.itemName}>
                  {type === 'bill' ? item.name : type === 'expense' ? item.category : item.source}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {type === 'bill'
                    ? `${t('dueDate')}: ${new Date(item.dueDate).toLocaleDateString()}`
                    : new Date(item.date).toLocaleDateString()}
                </ThemedText>
              </View>
              <ThemedText
                type="default"
                style={[
                  styles.amount,
                  { color: type === 'income' ? '#10b981' : theme.text },
                ]}
              >
                {type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>{t('financeOverview')}</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/finance/create' as any)}
        >
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      {/* Chart Section */}
      <ThemedView style={[styles.chartCard, { backgroundColor: theme.background }]}>
        <PieChart
          data={chartData}
          width={Dimensions.get('window').width - Spacing.four * 2}
          height={190}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={'amount'}
          backgroundColor={'transparent'}
          paddingLeft={'15'}
          absolute
        />
        <View style={styles.balanceContainer}>
          <ThemedText type="small" themeColor="textSecondary">{t('netBalance')}</ThemedText>
          <ThemedText
            style={[
              styles.balanceAmount,
              {
                color:
                  totalIncome - totalExpense - totalBills >= 0
                    ? '#10b981'
                    : '#ef4444',
              },
            ]}
          >
            ${(totalIncome - totalExpense - totalBills).toFixed(2)}
          </ThemedText>
        </View>
      </ThemedView>

      <View style={styles.content}>
        {renderList(t('incomes'), incomes, 'income')}
        {renderList(t('expenses'), expenses, 'expense')}
        {renderList(t('bills'), bills, 'bill')}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    margin: Spacing.four,
    padding: Spacing.three,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  balanceContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: Spacing.two,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 2,
  },
  content: { paddingHorizontal: Spacing.four },
  section: { marginBottom: Spacing.five },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.three, marginLeft: Spacing.one },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  cardInfo: { flex: 1 },
  itemName: { fontWeight: '600', marginBottom: 2, fontSize: 16 },
  amount: { fontWeight: 'bold', fontSize: 16 },
});
