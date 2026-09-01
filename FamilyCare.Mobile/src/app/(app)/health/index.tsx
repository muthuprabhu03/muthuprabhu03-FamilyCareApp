import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { healthService } from '@/services/healthService';
import { familyMemberService } from '@/services/familyMemberService';
import { Medicine } from '@/types/health';
import { FamilyMember } from '@/types/family';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SkeletonCard, SkeletonBox } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DailyScheduleTimeline } from '@/components/ui/DailyScheduleTimeline';

export default function HealthScreen() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [medsData, membersData] = await Promise.allSettled([
        healthService.getMedicines(),
        familyMemberService.getAll(),
      ]);

      if (medsData.status === 'fulfilled') setMedicines(medsData.value);
      if (membersData.status === 'fulfilled') setFamilyMembers(membersData.value);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberName = (memberId: number) => {
    const member = familyMembers.find((m) => m.id === memberId);
    return member ? member.name : 'Family Member';
  };

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.instructions && med.instructions.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.dosage && med.dosage.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMember = selectedMemberId === null || med.familyMemberId === selectedMemberId;

    return matchesSearch && matchesMember;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="default" style={styles.title}>
            {t('medicines')}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {medicines.length} {medicines.length === 1 ? 'active prescription' : 'active prescriptions'}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }, Shadows.glowPrimary]}
          onPress={() => router.push('/(app)/health/create' as any)}
          activeOpacity={0.85}
        >
          <AppIcon name="plus" tintColor="#fff" size={20} />
        </TouchableOpacity>
      </ThemedView>

      {/* Summary Highlight Hero */}
      <View style={styles.section}>
        <View
          style={[
            styles.healthHero,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={styles.heroLeft}>
            <View style={[styles.heroIconBox, { backgroundColor: theme.pinkBg }]}>
              <AppIcon name="cross.case.fill" tintColor={theme.pink} size={28} />
            </View>
            <View>
              <ThemedText style={styles.heroTitle}>Health & Prescriptions</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Daily medicine schedule & dosages
              </ThemedText>
            </View>
          </View>
          <View style={[styles.activePill, { backgroundColor: theme.pinkBg }]}>
            <ThemedText style={[styles.activePillText, { color: theme.pink }]}>
              {medicines.length} Active
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Graphical Daily Medication Timeline & Adherence Tracker */}
      <View style={styles.section}>
        <DailyScheduleTimeline activeMedicinesCount={medicines.length} />
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.section}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.inputBg, borderColor: theme.inputBorder },
          ]}
        >
          <AppIcon name="magnifyingglass" tintColor={theme.textSecondary} size={18} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search medicine name or dosage..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <AppIcon name="xmark" tintColor={theme.textSecondary} size={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* Member Filter Chips */}
        {familyMembers.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberFilterScroll}
          >
            <TouchableOpacity
              style={[
                styles.memberFilterChip,
                {
                  backgroundColor: selectedMemberId === null ? theme.primary : theme.card,
                  borderColor: selectedMemberId === null ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => setSelectedMemberId(null)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.memberFilterText,
                  { color: selectedMemberId === null ? '#ffffff' : theme.text },
                ]}
              >
                All Members
              </ThemedText>
            </TouchableOpacity>

            {familyMembers.map((member) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberFilterChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedMemberId(member.id)}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={[
                      styles.memberFilterText,
                      { color: isSelected ? '#ffffff' : theme.text },
                    ]}
                  >
                    {member.name.split(' ')[0]}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Medicines List */}
      <View style={styles.section}>
        {isLoading ? (
          <View>
            <SkeletonCard style={{ marginBottom: Spacing.three }} />
            <SkeletonCard style={{ marginBottom: Spacing.three }} />
            <SkeletonCard style={{ marginBottom: Spacing.three }} />
          </View>
        ) : filteredMedicines.length === 0 ? (
          <EmptyState
            icon="cross.case.fill"
            message={searchQuery ? 'No matching medicines' : t('noMedicines')}
            description={
              searchQuery
                ? 'Try searching with another keyword.'
                : 'Keep your family safe by logging medications and dosage schedules.'
            }
            actionLabel={t('add')}
            onAction={() => router.push('/(app)/health/create' as any)}
          />
        ) : (
          filteredMedicines.map((med) => (
            <TouchableOpacity
              key={med.id}
              onPress={() => router.push(`/(app)/health/${med.id}` as any)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  Shadows.soft,
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.pinkBg }]}>
                  <AppIcon name="cross.case.fill" tintColor={theme.pink} size={22} />
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardHeaderRow}>
                    <ThemedText type="default" style={styles.medName}>
                      {med.name}
                    </ThemedText>
                    {med.dosage ? (
                      <StatusBadge
                        label={med.dosage}
                        variant="pink"
                        size="sm"
                        showDot={false}
                      />
                    ) : null}
                  </View>

                  <ThemedText type="small" themeColor="textSecondary" style={styles.memberTag}>
                    For: {getMemberName(med.familyMemberId)}
                  </ThemedText>

                  {med.instructions ? (
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.instructions}>
                      {med.instructions}
                    </ThemedText>
                  ) : null}

                  {(med.startDate || med.endDate) && (
                    <View style={styles.dateRow}>
                      <AppIcon name="calendar" tintColor={theme.textSecondary} size={12} />
                      <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 4, fontSize: 11 }}>
                        {med.startDate ? new Date(med.startDate).toLocaleDateString() : ''}
                        {med.endDate ? ` - ${new Date(med.endDate).toLocaleDateString()}` : ''}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.chevronBox}>
                  <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={16} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
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
  section: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  healthHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  activePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  activePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: Spacing.two,
    fontSize: 14,
  },
  memberFilterScroll: {
    paddingVertical: Spacing.one,
    gap: 8,
  },
  memberFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  memberFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.four,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  cardInfo: { flex: 1 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medName: { fontWeight: '700', fontSize: 16 },
  memberTag: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 12,
  },
  instructions: {
    lineHeight: 18,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  chevronBox: {
    paddingLeft: Spacing.two,
    paddingTop: 12,
  },
});
