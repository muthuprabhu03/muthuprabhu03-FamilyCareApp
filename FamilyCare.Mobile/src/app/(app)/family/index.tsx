import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { familyMemberService } from '@/services/familyMemberService';
import { FamilyMember } from '@/types/family';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';
import { StatusBadge } from '@/components/ui/StatusBadge';

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="default" style={styles.title}>
            {t('familyMembers')}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {members.length} {members.length === 1 ? 'member' : 'members'} in your circle
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }, Shadows.glowPrimary]}
          onPress={() => router.push('/(app)/family/create' as any)}
          activeOpacity={0.85}
        >
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View>
            <SkeletonCard style={{ marginBottom: Spacing.three }} />
            <SkeletonCard style={{ marginBottom: Spacing.three }} />
            <SkeletonCard style={{ marginBottom: Spacing.three }} />
          </View>
        ) : members.length === 0 ? (
          <EmptyState
            icon="person.2.fill"
            message={t('noMembersFound')}
            description="Add your first family member to track their health, finances, and location."
            actionLabel={t('addMember')}
            onAction={() => router.push('/(app)/family/create' as any)}
          />
        ) : (
          members.map((member) => (
            <TouchableOpacity
              key={member.id}
              onPress={() => router.push(`/(app)/family/${member.id}` as any)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  Shadows.soft,
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.avatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.cardInfo}>
                  <ThemedText type="default" style={styles.memberName}>
                    {member.name}
                  </ThemedText>
                  <View style={styles.metaRow}>
                    <StatusBadge
                      label={member.relationship || 'Member'}
                      variant="purple"
                      size="sm"
                      showDot={false}
                    />
                    <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 8 }}>
                      {member.age} yrs
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.arrowCircle}>
                  <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={16} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: Spacing.four },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: { color: '#ffffff', fontWeight: '800', fontSize: 19 },
  cardInfo: { flex: 1 },
  memberName: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
