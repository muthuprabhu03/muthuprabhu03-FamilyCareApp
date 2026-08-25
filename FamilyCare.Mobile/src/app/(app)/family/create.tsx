import { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { familyMemberService } from '@/services/familyMemberService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function CreateFamilyScreen() {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleSave = async () => {
    if (!name || !relationship || !age) {
      Alert.alert('Error', 'Name, Relationship, and Age are required.');
      return;
    }

    setIsLoading(true);
    try {
      await familyMemberService.create({
        name,
        relationship,
        age: parseInt(age, 10),
        phone: phone || undefined,
        email: email || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>Add Member</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.formCard, { backgroundColor: theme.background }]}>
        <FormInput 
          label="Full Name *" 
          value={name} 
          onChangeText={setName} 
          placeholder="e.g. John Doe"
        />
        <FormInput 
          label="Relationship *" 
          value={relationship} 
          onChangeText={setRelationship} 
          placeholder="e.g. Father, Spouse"
        />
        <FormInput 
          label="Age *" 
          value={age} 
          onChangeText={setAge} 
          keyboardType="numeric"
          placeholder="e.g. 45"
        />
        <FormInput 
          label="Phone Number" 
          value={phone} 
          onChangeText={setPhone} 
          keyboardType="phone-pad"
          placeholder="(Optional)"
        />
        <FormInput 
          label="Email Address" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="(Optional)"
        />

        <PrimaryButton 
          title="Save Member" 
          onPress={handleSave} 
          isLoading={isLoading} 
          style={styles.saveBtn}
        />
        <PrimaryButton 
          title="Cancel" 
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
  cancelBtn: { backgroundColor: '#94a3b8', marginTop: Spacing.one }
});
