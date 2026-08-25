import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { familyMemberService } from '@/services/familyMemberService';
import { FamilyMember } from '@/types/family';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';

export default function FamilyScreen() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  const loadMembers = async () => {
    try {
      const data = await familyMemberService.getAll();
      setMembers(data);
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
        <ThemedText type="default" style={styles.title}>{t('familyMembers')}</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(app)/family/create' as any)}>
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        {members.length === 0 ? (
          <EmptyState 
            message={t('noMembersFound')} 
            actionLabel={t('addMember')} 
            onAction={() => router.push('/(app)/family/create' as any)} 
          />
        ) : (
          members.map(member => (
            <TouchableOpacity 
              key={member.id} 
              onPress={() => router.push(`/(app)/family/${member.id}` as any)}
            >
              <ThemedView style={[styles.card, { backgroundColor: theme.background }]}>
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</ThemedText>
                </View>
                <ThemedView style={styles.cardInfo}>
                  <ThemedText type="default" style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{member.relationship} • {member.age} yrs</ThemedText>
                </ThemedView>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  cardInfo: { flex: 1, backgroundColor: 'transparent' },
  memberName: { fontWeight: '600', marginBottom: 2, fontSize: 16 }
});
