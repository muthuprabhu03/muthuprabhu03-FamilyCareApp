import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { reminderService } from '@/services/reminderService';
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

export default function CreateReminderScreen() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
    if (!title || !familyMemberId || !date) {
      Alert.alert(t('error'), `${t('reminderTitle')}, ${t('date')}, & ${t('familyMember')} are required.`);
      return;
    }

    setIsLoading(true);
    try {
      await reminderService.createReminder({
        familyMemberId: Number(familyMemberId),
        title,
        description: description || undefined,
        reminderAt: new Date(date).toISOString(),
        isCompleted: false,
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
        <ThemedText type="default" style={styles.title}>{t('addReminderTitle')}</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        <FormInput
          label={`${t('reminderTitle')} *`}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Doctor appointment, Give medication"
        />

        <FormInput
          label={t('description')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('optional')}
        />

        <FormInput
          label={`${t('date')} (YYYY-MM-DD) *`}
          value={date}
          onChangeText={setDate}
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
