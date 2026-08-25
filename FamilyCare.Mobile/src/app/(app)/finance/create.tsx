import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { financeService } from '@/services/financeService';
import { familyMemberService } from '@/services/familyMemberService';
import { FamilyMember } from '@/types/family';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SelectDropdown, DropdownItem } from '@/components/ui/SelectDropdown';
import { useTranslation } from '@/i18n';

type FinanceType = 'expense' | 'income' | 'bill';

export default function CreateFinanceScreen() {
  const { t } = useTranslation();
  const [type, setType] = useState<FinanceType>('expense');
  const [categoryName, setCategoryName] = useState('Groceries');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [description, setDescription] = useState('');
  const [familyMemberId, setFamilyMemberId] = useState<string | number>('');
  
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await familyMemberService.getAll();
        setMembers(data);
        if (data.length > 0) setFamilyMemberId(data[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    loadMembers();
  }, []);

  // Update default category when type changes
  useEffect(() => {
    if (type === 'income') setCategoryName('Salary');
    else if (type === 'expense') setCategoryName('Groceries');
    else if (type === 'bill') setCategoryName('Electricity Bill');
  }, [type]);

  const incomeCategories: DropdownItem[] = [
    { id: 'Salary', label: t('salary'), icon: 'banknote.fill', iconColor: '#10b981' },
    { id: 'Business', label: t('business'), icon: 'briefcase.fill', iconColor: '#059669' },
    { id: 'Freelance', label: t('freelance'), icon: 'laptopcomputer', iconColor: '#3b82f6' },
    { id: 'Investments', label: t('investments'), icon: 'chart.line.uptrend.xyaxis', iconColor: '#6366f1' },
    { id: 'Rental Income', label: t('rentalIncome'), icon: 'house.fill', iconColor: '#8b5cf6' },
    { id: 'Other Income', label: t('otherIncome'), icon: 'plus.circle.fill', iconColor: '#10b981' },
  ];

  const expenseCategories: DropdownItem[] = [
    { id: 'Groceries', label: t('groceries'), icon: 'cart.fill', iconColor: '#f59e0b' },
    { id: 'Rent & Housing', label: t('rent'), icon: 'building.2.fill', iconColor: '#ef4444' },
    { id: 'Utilities', label: t('utilities'), icon: 'bolt.fill', iconColor: '#f97316' },
    { id: 'Healthcare & Medical', label: t('healthcare'), icon: 'cross.case.fill', iconColor: '#ec4899' },
    { id: 'Transportation & Fuel', label: t('transportation'), icon: 'car.fill', iconColor: '#06b6d4' },
    { id: 'Education', label: t('education'), icon: 'book.fill', iconColor: '#8b5cf6' },
    { id: 'Dining & Food', label: t('dining'), icon: 'fork.knife', iconColor: '#eab308' },
    { id: 'Entertainment', label: t('entertainment'), icon: 'tv.fill', iconColor: '#a855f7' },
    { id: 'Other Expense', label: t('otherExpense'), icon: 'creditcard.fill', iconColor: '#64748b' },
  ];

  const billCategories: DropdownItem[] = [
    { id: 'Electricity Bill', label: t('electricityBill'), icon: 'bolt.fill', iconColor: '#f59e0b' },
    { id: 'Water Bill', label: t('waterBill'), icon: 'drop.fill', iconColor: '#06b6d4' },
    { id: 'Internet & WiFi', label: t('internetBill'), icon: 'wifi', iconColor: '#3b82f6' },
    { id: 'Mobile & Phone', label: t('mobileBill'), icon: 'phone.fill', iconColor: '#10b981' },
    { id: 'Insurance', label: t('insuranceBill'), icon: 'shield.fill', iconColor: '#6366f1' },
    { id: 'Credit Card Payment', label: t('creditCardBill'), icon: 'creditcard.fill', iconColor: '#ef4444' },
    { id: 'Gas Bill', label: t('gasBill'), icon: 'flame.fill', iconColor: '#f97316' },
  ];

  const memberDropdownItems: DropdownItem[] = members.map((m) => ({
    id: m.id,
    label: m.name,
    subLabel: `${m.relationship} • ${m.age} yrs`,
    icon: 'person.crop.circle.fill',
    iconColor: '#667eea',
  }));

  const activeCategories =
    type === 'income'
      ? incomeCategories
      : type === 'expense'
      ? expenseCategories
      : billCategories;

  const handleSave = async () => {
    const finalName = customName.trim() || categoryName;

    if (!finalName || !amount || !date) {
      Alert.alert(t('error'), `${t('name')}, ${t('amount')}, & ${t('date')} are required.`);
      return;
    }

    if ((type === 'expense' || type === 'income') && !familyMemberId) {
      Alert.alert(t('error'), t('selectFamilyMember'));
      return;
    }

    setIsLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      const parsedDate = new Date(date).toISOString();

      if (type === 'bill') {
        await financeService.createBill({
          name: finalName,
          amount: parsedAmount,
          dueDate: parsedDate,
          description: description || undefined,
        });
      } else if (type === 'expense') {
        await financeService.createExpense({
          familyMemberId: Number(familyMemberId),
          category: finalName,
          amount: parsedAmount,
          date: parsedDate,
          description: description || undefined,
        });
      } else {
        await financeService.createIncome({
          familyMemberId: Number(familyMemberId),
          source: finalName,
          amount: parsedAmount,
          date: parsedDate,
          description: description || undefined,
        });
      }
      router.back();
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>{t('addTransaction')}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        {/* Segmented Type Selector */}
        <View style={styles.typeSelector}>
          {(['expense', 'income', 'bill'] as FinanceType[]).map((tType) => (
            <TouchableOpacity
              key={tType}
              style={[
                styles.typeButton,
                type === tType && { backgroundColor: '#667eea' },
              ]}
              onPress={() => setType(tType)}
            >
              <ThemedText
                style={[
                  styles.typeText,
                  type === tType && { color: '#fff', fontWeight: 'bold' },
                ]}
              >
                {t(tType)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category / Source Dropdown */}
        <SelectDropdown
          label={type === 'income' ? t('source') : type === 'expense' ? t('category') : t('name')}
          required
          items={activeCategories}
          selectedValue={categoryName}
          onSelect={(item) => setCategoryName(String(item.id))}
        />

        {/* Optional Custom Name */}
        <FormInput
          label={`${t('name')} ${t('optional')}`}
          value={customName}
          onChangeText={setCustomName}
          placeholder="Custom title (Optional)"
        />

        {/* Amount */}
        <FormInput
          label={`${t('amount')} *`}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        {/* Date */}
        <FormInput
          label={`${t('date')} (YYYY-MM-DD) *`}
          value={date}
          onChangeText={setDate}
        />

        {/* Family Member Picker (Name instead of ID) */}
        {type !== 'bill' && (
          <SelectDropdown
            label={t('familyMember')}
            required
            placeholder={t('selectFamilyMember')}
            items={memberDropdownItems}
            selectedValue={familyMemberId}
            onSelect={(item) => setFamilyMemberId(item.id)}
          />
        )}

        {/* Description */}
        <FormInput
          label={t('description')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('optional')}
        />

        <PrimaryButton
          title={t('save')}
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.saveBtn}
        />
        <PrimaryButton
          title={t('cancel')}
          onPress={() => router.back()}
          style={styles.cancelBtn}
          disabled={isLoading}
        />
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
  title: { fontSize: 24, fontWeight: 'bold' },
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeText: {
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  saveBtn: { marginTop: Spacing.three },
  cancelBtn: { backgroundColor: '#94a3b8', marginTop: Spacing.one },
});
