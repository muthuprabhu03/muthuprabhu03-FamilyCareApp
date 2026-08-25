import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { healthService } from '@/services/healthService';
import { Medicine } from '@/types/health';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { confirmAction } from '@/utils/alerts';

export default function MedicineDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await healthService.getMedicineById(parseInt(id, 10));
      setName(data.name);
      setDosage(data.dosage || '');
      setInstructions(data.instructions || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load medicine');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    setIsSaving(true);
    try {
      await healthService.updateMedicine(parseInt(id, 10), {
        name,
        dosage: dosage || undefined,
        instructions: instructions || undefined,
      });
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
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      async () => {
        setIsSaving(true);
        try {
          await healthService.deleteMedicine(parseInt(id, 10));
          router.back();
        } catch (error: any) {
          Alert.alert('Error', error.message);
          setIsSaving(false);
        }
      }
    );
  };

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>Edit Medicine</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        <FormInput label="Medicine Name *" value={name} onChangeText={setName} />
        <FormInput label="Dosage" value={dosage} onChangeText={setDosage} />
        <FormInput label="Instructions" value={instructions} onChangeText={setInstructions} />

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
  deleteBtn: { backgroundColor: '#ef4444', marginTop: Spacing.one }
});
