import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { familyMemberService } from '@/services/familyMemberService';
import { reminderService } from '@/services/reminderService';
import { financeService } from '@/services/financeService';
import { healthService } from '@/services/healthService';
import { FamilyMember } from '@/types/family';
import { Reminder } from '@/types/reminder';
import { Bill, Expense, Income } from '@/types/finance';
import { Medicine } from '@/types/health';
import { authService } from '@/services/authService';
import { User } from '@/types/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';
import { ThemeSwitcherButton } from '@/components/ui/ThemeSwitcherButton';
import { SkeletonDashboard } from '@/components/ui/SkeletonLoader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityRingWidget } from '@/components/ui/ActivityRingWidget';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);

      if (userData) {
        const [membersRes, remindersRes, billsRes, expensesRes, incomesRes, medsRes] =
          await Promise.allSettled([
            familyMemberService.getAll(),
            reminderService.getReminders(),
            financeService.getBills(),
            financeService.getExpenses(),
            financeService.getIncomes(),
            healthService.getMedicines(),
          ]);

        if (membersRes.status === 'fulfilled') setFamilyMembers(membersRes.value);
        if (remindersRes.status === 'fulfilled') setReminders(remindersRes.value);
        if (billsRes.status === 'fulfilled') setBills(billsRes.value);
        if (expensesRes.status === 'fulfilled') setExpenses(expensesRes.value);
        if (incomesRes.status === 'fulfilled') setIncomes(incomesRes.value);
        if (medsRes.status === 'fulfilled') setMedicines(medsRes.value);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isLoading) {
    return <SkeletonDashboard />;
  }

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning') || 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userInitial = (user.email.charAt(0) || 'U').toUpperCase();
  const userName = user.email.split('@')[0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar */}
      <ThemedView style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.profileAvatar, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(app)/more/settings' as any)}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.profileAvatarText}>{userInitial}</ThemedText>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.greetingText}>
              {getGreeting()},
            </ThemedText>
            <ThemedText type="default" style={styles.nameText}>
              {userName}
            </ThemedText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <ThemeSwitcherButton />
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/(app)/more/settings' as any)}
            activeOpacity={0.7}
          >
            <AppIcon name="gear" tintColor={theme.text} size={20} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Flagship Financial Hero Card */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/(app)/finance' as any)}
          style={[styles.heroFinanceCard, Shadows.strong]}
        >
          {/* Card Header */}
          <View style={styles.heroHeaderRow}>
            <View>
              <View style={styles.heroTagRow}>
                <ThemedText style={styles.heroSubtitle}>FAMILY NET BALANCE</ThemedText>
                <TouchableOpacity
                  onPress={() => setIsBalanceHidden(!isBalanceHidden)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeIconBtn}
                >
                  <AppIcon
                    name={isBalanceHidden ? 'ellipsis.circle.fill' : 'sun.max.fill'}
                    tintColor="rgba(255,255,255,0.7)"
                    size={16}
                  />
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.heroBalance}>
                {isBalanceHidden ? '$ ••••••' : `$${netBalance.toFixed(2)}`}
              </ThemedText>
            </View>

            <View style={styles.heroIconCircle}>
              <AppIcon name="creditcard.fill" tintColor="#6366f1" size={24} />
            </View>
          </View>

          {/* Income & Expense Breakdown Pills */}
          <View style={styles.heroFooter}>
            <View style={styles.heroPill}>
              <View style={[styles.pillIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <AppIcon name="arrow.down.circle.fill" tintColor="#10b981" size={16} />
              </View>
              <View style={{ marginLeft: 8 }}>
                <ThemedText style={styles.heroPillLabel}>Total Income</ThemedText>
                <ThemedText style={styles.heroPillValue}>
                  {isBalanceHidden ? '••••' : `+$${totalIncome.toFixed(2)}`}
                </ThemedText>
              </View>
            </View>

            <View style={styles.heroPillDivider} />

            <View style={styles.heroPill}>
              <View style={[styles.pillIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <AppIcon name="cart.fill" tintColor="#ef4444" size={16} />
              </View>
              <View style={{ marginLeft: 8 }}>
                <ThemedText style={styles.heroPillLabel}>Total Expenses</ThemedText>
                <ThemedText style={styles.heroPillValue}>
                  {isBalanceHidden ? '••••' : `-$${totalExpense.toFixed(2)}`}
                </ThemedText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Activity Progress Rings */}
      <View style={styles.section}>
        <ActivityRingWidget
          taskCompletionRate={
            reminders.length > 0
              ? (reminders.length - pendingReminders.length) / reminders.length
              : 0.85
          }
          budgetHealthRate={
            totalIncome > 0
              ? Math.max(0.1, Math.min(1, (totalIncome - totalExpense) / totalIncome))
              : 0.7
          }
          medicineAdherenceRate={medicines.length > 0 ? 0.85 : 1.0}
        />
      </View>

      {/* 4-Grid Glance Cards */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeaderTitle}>
            OVERVIEW AT A GLANCE
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          {/* Family Members */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/family' as any)}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              Shadows.soft,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.statTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: theme.purpleBg }]}>
                <AppIcon name="person.2.fill" tintColor={theme.purple} size={20} />
              </View>
              <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={14} />
            </View>
            <ThemedText style={styles.statNumber}>{familyMembers.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Family Members
            </ThemedText>
          </TouchableOpacity>

          {/* Pending Tasks */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/more/reminders' as any)}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              Shadows.soft,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.statTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: theme.warningBg }]}>
                <AppIcon name="bell.fill" tintColor={theme.warning} size={20} />
              </View>
              <StatusBadge
                label={`${pendingReminders.length}`}
                variant={pendingReminders.length > 0 ? 'warning' : 'neutral'}
                size="sm"
                showDot={false}
              />
            </View>
            <ThemedText style={styles.statNumber}>{pendingReminders.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Pending Tasks
            </ThemedText>
          </TouchableOpacity>

          {/* Medicines */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/health' as any)}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              Shadows.soft,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.statTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: theme.pinkBg }]}>
                <AppIcon name="cross.case.fill" tintColor={theme.pink} size={20} />
              </View>
              <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={14} />
            </View>
            <ThemedText style={styles.statNumber}>{medicines.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Medicines Active
            </ThemedText>
          </TouchableOpacity>

          {/* Bills */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/finance' as any)}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              Shadows.soft,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.statTopRow}>
              <View style={[styles.statIconBox, { backgroundColor: theme.dangerBg }]}>
                <AppIcon name="dollarsign.circle.fill" tintColor={theme.danger} size={20} />
              </View>
              <StatusBadge
                label={`${bills.length}`}
                variant={bills.length > 0 ? 'danger' : 'neutral'}
                size="sm"
                showDot={false}
              />
            </View>
            <ThemedText style={styles.statNumber}>{bills.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Active Bills
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flash AI Assistant Illuminated Banner */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => router.push('/(app)/more/ai-assistant' as any)}
          style={[styles.aiBanner, Shadows.glowPrimary]}
          activeOpacity={0.88}
        >
          <View style={styles.aiBannerIcon}>
            <AppIcon name="bolt.fill" tintColor="#6366f1" size={24} />
          </View>
          <View style={styles.aiBannerTextContainer}>
            <View style={styles.aiTitleRow}>
              <ThemedText style={styles.aiBannerTitle}>Flash AI Assistant</ThemedText>
              <View style={styles.aiLiveBadge}>
                <ThemedText style={styles.aiLiveText}>LIVE</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.aiBannerSubtitle}>
              Ask Flash about pending tasks, bills, finances & medicines
            </ThemedText>
          </View>
          <View style={styles.aiArrowBox}>
            <AppIcon name="chevron.right" tintColor="#ffffff" size={16} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Family Circle Live Strip */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeaderTitle}>
            {t('familyOverview')}
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(app)/family' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: '700' }}>
              {t('seeAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              onPress={() => router.push(`/(app)/family/${member.id}` as any)}
              style={styles.avatarContainer}
              activeOpacity={0.8}
            >
              <View style={[styles.avatarRing, { borderColor: theme.primary }]}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.avatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="small" style={styles.avatarLabel} numberOfLines={1}>
                {member.name.split(' ')[0]}
              </ThemedText>
            </TouchableOpacity>
          ))}

          {/* Add Family Member Button */}
          <TouchableOpacity
            onPress={() => router.push('/(app)/family/create' as any)}
            style={styles.avatarContainer}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatarAddRing,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <AppIcon name="plus" tintColor={theme.primary} size={22} />
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.avatarLabel}>
              {t('add')}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Upcoming Reminders & Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeaderTitle}>
            UPCOMING TASKS &amp; REMINDERS
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(app)/more/reminders' as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: '700' }}>
              {t('seeAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {pendingReminders.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              Shadows.soft,
            ]}
          >
            <View style={[styles.emptyIconBox, { backgroundColor: theme.successBg }]}>
              <AppIcon name="checkmark.circle.fill" tintColor={theme.success} size={28} />
            </View>
            <ThemedText style={styles.emptyTitle}>All Caught Up!</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
              No pending tasks right now. Great job keeping the family on track!
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/(app)/more/reminders/create' as any)}
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
            >
              <ThemedText style={styles.emptyBtnText}>+ Add Reminder</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          pendingReminders.slice(0, 3).map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => router.push('/(app)/more/reminders' as any)}
              style={[
                styles.taskItem,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                Shadows.soft,
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.taskIconBox, { backgroundColor: theme.warningBg }]}>
                <AppIcon name="bell.fill" tintColor={theme.warning} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.taskTitle}>{r.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(r.reminderAt).toLocaleDateString()} •{' '}
                  {new Date(r.reminderAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </View>
              <StatusBadge label="Pending" variant="warning" size="sm" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.section}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeaderTitle}>
          {t('quickActions')}
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          {[
            {
              label: t('addExpense'),
              icon: 'cart.fill',
              route: '/(app)/finance/create',
              color: '#ef4444',
              bg: theme.dangerBg,
            },
            {
              label: t('addMedicine'),
              icon: 'cross.case.fill',
              route: '/(app)/health/create',
              color: '#ec4899',
              bg: theme.pinkBg,
            },
            {
              label: t('addReminder'),
              icon: 'bell.badge.fill',
              route: '/(app)/more/reminders/create',
              color: '#f97316',
              bg: theme.warningBg,
            },
            {
              label: t('viewMap'),
              icon: 'map.fill',
              route: '/(app)/more/location',
              color: '#06b6d4',
              bg: theme.surfaceSubtle,
            },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                Shadows.soft,
              ]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.bg }]}>
                <AppIcon name={action.icon as any} tintColor={action.color} size={22} />
              </View>
              <ThemedText type="small" style={styles.quickActionLabel}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
    position: 'relative',
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  section: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  sectionHeaderTitle: {
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  heroFinanceCard: {
    backgroundColor: '#131828',
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.four,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  eyeIconBtn: {
    padding: 2,
  },
  heroBalance: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFooter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
  },
  heroPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPillLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  heroPillValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  heroPillDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    width: '48.5%',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.xl,
    backgroundColor: '#6366f1',
  },
  aiBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  aiBannerTextContainer: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  aiBannerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  aiLiveBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiLiveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiBannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  aiArrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  horizontalScroll: {
    paddingVertical: Spacing.one,
    paddingRight: Spacing.four,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: Spacing.three,
    width: 64,
  },
  avatarRing: {
    padding: 2,
    borderWidth: 2,
    borderRadius: 34,
    marginBottom: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarAddRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  avatarLabel: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.three,
    fontSize: 13,
    maxWidth: 260,
  },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
    borderWidth: 1,
  },
  taskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionCard: {
    width: '48.5%',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  bottomPadding: {
    height: 40,
  },
});
