import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { healthService } from '@/services/healthService';
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

export default function CreateMedicineScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
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
      } catch (e) {}
    };
    loadMembers();
  }, []);

  const memberDropdownItems: DropdownItem[] = members.map((m) => ({
    id: m.id,
    label: m.name,
    subLabel: `${m.relationship} • ${m.age} yrs`,
    icon: 'person.crop.circle.fill',
    iconColor: '#667eea',
  }));

  const handleSave = async () => {
    if (!name || !familyMemberId) {
      Alert.alert(t('error'), `${t('medicineName')} & ${t('familyMember')} are required.`);
      return;
    }

    setIsLoading(true);
    try {
      await healthService.createMedicine({
        familyMemberId: Number(familyMemberId),
        name,
        dosage: dosage || undefined,
        instructions: instructions || undefined,
        startDate: new Date().toISOString(),
      });
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
        <ThemedText type="default" style={styles.title}>{t('addMedicineTitle')}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        <FormInput
          label={`${t('medicineName')} *`}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Paracetamol, Metformin"
        />

        <FormInput
          label={t('dosage')}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g. 500mg, 1 tablet"
        />

        <FormInput
          label={t('instructions')}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="e.g. After breakfast"
        />

        <SelectDropdown
          label={t('familyMember')}
          required
          placeholder={t('selectFamilyMember')}
          items={memberDropdownItems}
          selectedValue={familyMemberId}
          onSelect={(item) => setFamilyMemberId(item.id)}
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
  saveBtn: { marginTop: Spacing.three },
  cancelBtn: { backgroundColor: '#94a3b8', marginTop: Spacing.one },
});
