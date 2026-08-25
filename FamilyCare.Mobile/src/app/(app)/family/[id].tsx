import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { familyMemberService } from '@/services/familyMemberService';
import { FamilyMember } from '@/types/family';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { confirmAction } from '@/utils/alerts';

export default function MemberDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      const data = await familyMemberService.getById(parseInt(id, 10));
      setMember(data);
      setName(data.name);
      setRelationship(data.relationship);
      setAge(data.age.toString());
      setPhone(data.phone || '');
      setEmail(data.email || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load member');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name || !relationship || !age) {
      Alert.alert('Error', 'Name, Relationship, and Age are required.');
      return;
    }

    setIsSaving(true);
    try {
      await familyMemberService.update(parseInt(id, 10), {
        name,
        relationship,
        age: parseInt(age, 10),
        phone: phone || undefined,
        email: email || undefined,
        isActive: member?.isActive ?? true
      });
      Alert.alert('Success', 'Member updated successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    confirmAction(
      'Delete Member',
      'Are you sure you want to delete this family member?',
      async () => {
        setIsSaving(true);
        try {
          await familyMemberService.delete(parseInt(id, 10));
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
        <ThemedText type="default" style={styles.title}>Edit Member</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        <FormInput label="Full Name *" value={name} onChangeText={setName} />
        <FormInput label="Relationship *" value={relationship} onChangeText={setRelationship} />
        <FormInput label="Age *" value={age} onChangeText={setAge} keyboardType="numeric" />
        <FormInput label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <FormInput label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <PrimaryButton title="Update Member" onPress={handleUpdate} isLoading={isSaving} style={styles.saveBtn} />
        <PrimaryButton title="Delete Member" onPress={handleDelete} disabled={isSaving} style={styles.deleteBtn} />
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
