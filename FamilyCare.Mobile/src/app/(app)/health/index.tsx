import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { healthService } from '@/services/healthService';
import { Medicine } from '@/types/health';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';

export default function HealthScreen() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

  const loadMedicines = async () => {
    try {
      const data = await healthService.getMedicines();
      setMedicines(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>{t('medicines')}</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(app)/health/create' as any)}>
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        {medicines.length === 0 ? (
          <EmptyState 
            message={t('noMedicines')} 
            actionLabel={t('add')} 
            onAction={() => router.push('/(app)/health/create' as any)} 
          />
        ) : (
          medicines.map(med => (
            <TouchableOpacity 
              key={med.id} 
              onPress={() => router.push(`/(app)/health/${med.id}` as any)}
            >
              <ThemedView style={[styles.card, { backgroundColor: theme.background }]}>
                <View style={styles.iconBox}>
                  <AppIcon name="cross.case.fill" tintColor="#ec4899" size={22} />
                </View>
                <View style={styles.cardInfo}>
                  <ThemedText type="default" style={styles.medName}>{med.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{med.dosage || t('optional')}</ThemedText>
                </View>
                <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={18} />
              </ThemedView>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>
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
  content: { padding: Spacing.three, backgroundColor: 'transparent' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  cardInfo: { flex: 1, backgroundColor: 'transparent' },
  medName: { fontWeight: '600', marginBottom: 2, fontSize: 16 }
});
