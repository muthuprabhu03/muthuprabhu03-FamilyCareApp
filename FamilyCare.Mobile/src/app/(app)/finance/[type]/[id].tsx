import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { financeService } from '@/services/financeService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { confirmAction } from '@/utils/alerts';

export default function FinanceDetailsScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'bill' | 'expense' | 'income'; id: string }>();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, [id, type]);

  const loadData = async () => {
    try {
      const recordId = parseInt(id, 10);
      if (type === 'bill') {
        const data = await financeService.getBillById(recordId);
        setName(data.name);
        setAmount(data.amount.toString());
        setDate(data.dueDate.split('T')[0]);
        setDescription(data.description || '');
      } else if (type === 'expense') {
        const data = await financeService.getExpenseById(recordId);
        setName(data.category);
        setAmount(data.amount.toString());
        setDate(data.date.split('T')[0]);
        setDescription(data.description || '');
      } else {
        const data = await financeService.getIncomeById(recordId);
        setName(data.source);
        setAmount(data.amount.toString());
        setDate(data.date.split('T')[0]);
        setDescription(data.description || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name || !amount || !date) {
      Alert.alert('Error', 'Name, Amount, and Date are required.');
      return;
    }
    setIsSaving(true);
    try {
      const recordId = parseInt(id, 10);
      const parsedAmount = parseFloat(amount);
      const parsedDate = new Date(date).toISOString();

      if (type === 'bill') {
        await financeService.updateBill(recordId, {
          name,
          amount: parsedAmount,
          dueDate: parsedDate,
          description: description || undefined
        });
      } else if (type === 'expense') {
        await financeService.updateExpense(recordId, {
          category: name,
          amount: parsedAmount,
          date: parsedDate,
          description: description || undefined
        });
      } else {
        await financeService.updateIncome(recordId, {
          source: name,
          amount: parsedAmount,
          date: parsedDate,
          description: description || undefined
        });
      }
      Alert.alert('Success', 'Updated successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    confirmAction(
      'Delete',
      'Are you sure you want to delete this record?',
      async () => {
        setIsSaving(true);
        try {
          const recordId = parseInt(id, 10);
          if (type === 'bill') await financeService.deleteBill(recordId);
          if (type === 'expense') await financeService.deleteExpense(recordId);
          if (type === 'income') await financeService.deleteIncome(recordId);
          router.back();
        } catch (error: any) {
          Alert.alert('Error', error.message);
          setIsSaving(false);
        }
      }
    );
  };

  if (isLoading) return <LoadingState />;

  const nameLabel = type === 'bill' ? 'Bill Name' : type === 'expense' ? 'Category' : 'Income Source';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>Edit {type}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        <FormInput label={`${nameLabel} *`} value={name} onChangeText={setName} />
        <FormInput label="Amount *" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <FormInput label="Date (YYYY-MM-DD) *" value={date} onChangeText={setDate} />
        <FormInput label="Description" value={description} onChangeText={setDescription} />

        <PrimaryButton title="Update" onPress={handleUpdate} isLoading={isSaving} style={styles.saveBtn} />
        <PrimaryButton title="Delete" onPress={handleDelete} disabled={isSaving} style={styles.deleteBtn} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: 'transparent',
  },
  title: { fontSize: 24, fontWeight: 'bold', textTransform: 'capitalize' },
  formCard: {
    margin: Spacing.three,
    padding: Spacing.four,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  saveBtn: { marginTop: Spacing.three },
  deleteBtn: { backgroundColor: '#ef4444', marginTop: Spacing.one }
});
