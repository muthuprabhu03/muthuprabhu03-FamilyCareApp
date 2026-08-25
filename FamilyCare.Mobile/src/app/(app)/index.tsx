import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
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
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';
import { ThemeSwitcherButton } from '@/components/ui/ThemeSwitcherButton';

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
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </ThemedView>
    );
  }

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      {/* Header Profile & Quick Toggles */}
      <ThemedView style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="default" style={styles.greetingText}>{t('goodMorning')}</ThemedText>
          <ThemedText type="default" style={styles.nameText}>{user.email.split('@')[0]}</ThemedText>
        </View>
        <View style={styles.headerActions}>
          <ThemeSwitcherButton />
          <TouchableOpacity
            style={styles.settingsIconButton}
            onPress={() => router.push('/(app)/more/settings' as any)}
          >
            <AppIcon name="gear" tintColor={theme.text} size={20} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Financial Hero Summary Card */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(app)/finance' as any)}
          style={styles.heroFinanceCard}
        >
          <View style={styles.heroFinanceHeader}>
            <View>
              <ThemedText style={styles.heroSubtitle}>FAMILY NET BALANCE</ThemedText>
              <ThemedText style={styles.heroBalance}>${netBalance.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.heroIconCircle}>
              <AppIcon name="creditcard.fill" tintColor="#667eea" size={24} />
            </View>
          </View>

          <View style={styles.heroFinanceFooter}>
            <View style={styles.heroPill}>
              <AppIcon name="arrow.up.circle.fill" tintColor="#10b981" size={16} />
              <View style={{ marginLeft: 6 }}>
                <ThemedText style={styles.heroPillLabel}>Income</ThemedText>
                <ThemedText style={styles.heroPillValue}>${totalIncome.toFixed(2)}</ThemedText>
              </View>
            </View>

            <View style={styles.heroPillDivider} />

            <View style={styles.heroPill}>
              <AppIcon name="arrow.down.circle.fill" tintColor="#ef4444" size={16} />
              <View style={{ marginLeft: 6 }}>
                <ThemedText style={styles.heroPillLabel}>Expenses</ThemedText>
                <ThemedText style={styles.heroPillValue}>${totalExpense.toFixed(2)}</ThemedText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Family Stats 4-Grid Glance */}
      <View style={styles.section}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
          OVERVIEW AT A GLANCE
        </ThemedText>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            onPress={() => router.push('/(app)/family' as any)}
            style={[styles.statCard, { backgroundColor: theme.background }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#e0e7ff' }]}>
              <AppIcon name="person.2.fill" tintColor="#6366f1" size={20} />
            </View>
            <ThemedText style={styles.statNumber}>{familyMembers.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Family Members
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/more/reminders' as any)}
            style={[styles.statCard, { backgroundColor: theme.background }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#ffedd5' }]}>
              <AppIcon name="bell.fill" tintColor="#f97316" size={20} />
            </View>
            <ThemedText style={styles.statNumber}>{pendingReminders.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Pending Tasks
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/health' as any)}
            style={[styles.statCard, { backgroundColor: theme.background }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#fce7f3' }]}>
              <AppIcon name="cross.case.fill" tintColor="#ec4899" size={20} />
            </View>
            <ThemedText style={styles.statNumber}>{medicines.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Medicines
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/finance' as any)}
            style={[styles.statCard, { backgroundColor: theme.background }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#fee2e2' }]}>
              <AppIcon name="dollarsign.circle.fill" tintColor="#ef4444" size={20} />
            </View>
            <ThemedText style={styles.statNumber}>{bills.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              Bills
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flash AI Assistant Banner */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => router.push('/(app)/more/ai-assistant' as any)}
          style={styles.aiBanner}
        >
          <View style={styles.aiBannerIcon}>
            <AppIcon name="bolt.fill" tintColor="#6366f1" size={24} />
          </View>
          <View style={styles.aiBannerTextContainer}>
            <ThemedText style={styles.aiBannerTitle}>Flash AI Assistant</ThemedText>
            <ThemedText style={styles.aiBannerSubtitle}>
              Ask Flash about pending tasks, bills, finances &amp; medicines
            </ThemedText>
          </View>
          <AppIcon name="chevron.right" tintColor="#ffffff" size={20} />
        </TouchableOpacity>
      </View>

      {/* Family Circle Strip */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            {t('familyOverview')}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(app)/family' as any)}>
            <ThemedText type="small" style={{ color: '#667eea', fontWeight: 'bold' }}>
              {t('seeAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              onPress={() => router.push(`/(app)/family/${member.id}` as any)}
              style={styles.avatarContainer}
            >
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</ThemedText>
              </View>
              <ThemedText type="small" style={styles.avatarLabel} numberOfLines={1}>
                {member.name.split(' ')[0]}
              </ThemedText>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => router.push('/(app)/family/create' as any)}
            style={styles.avatarContainer}
          >
            <View style={[styles.avatar, { backgroundColor: '#e2e8f0' }]}>
              <AppIcon name="plus" tintColor="#64748b" size={24} />
            </View>
            <ThemedText type="small" style={styles.avatarLabel}>{t('add')}</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Today's Upcoming Tasks & Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            UPCOMING TASKS &amp; REMINDERS
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(app)/more/reminders' as any)}>
            <ThemedText type="small" style={{ color: '#667eea', fontWeight: 'bold' }}>
              {t('seeAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {pendingReminders.length === 0 ? (
          <ThemedView style={[styles.emptyCard, { backgroundColor: theme.background }]}>
            <AppIcon name="checkmark.circle.fill" tintColor="#10b981" size={32} />
            <ThemedText style={styles.emptyTitle}>All Caught Up!</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
              No pending tasks right now. Tap below to create one.
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/(app)/more/reminders/create' as any)}
              style={styles.emptyBtn}
            >
              <ThemedText style={styles.emptyBtnText}>+ Add Reminder</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          pendingReminders.slice(0, 3).map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => router.push('/(app)/more/reminders' as any)}
              style={[styles.taskItem, { backgroundColor: theme.background }]}
            >
              <View style={styles.taskIconBox}>
                <AppIcon name="bell.fill" tintColor="#f97316" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.taskTitle}>{r.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(r.reminderAt).toLocaleDateString()} • {new Date(r.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>
              <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={16} />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.section}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
          {t('quickActions')}
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          {[
            { label: t('addExpense'), icon: 'dollarsign.circle.fill', route: '/(app)/finance/create', color: '#10b981' },
            { label: t('addMedicine'), icon: 'cross.case.fill', route: '/(app)/health/create', color: '#ec4899' },
            { label: t('addReminder'), icon: 'bell.badge.fill', route: '/(app)/more/reminders/create', color: '#f97316' },
            { label: t('viewMap'), icon: 'map.fill', route: '/(app)/more/location', color: '#3b82f6' },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { backgroundColor: theme.background }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                <AppIcon name={action.icon as any} tintColor={action.color} size={24} />
              </View>
              <ThemedText type="small" style={styles.quickActionLabel}>{action.label}</ThemedText>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: { fontSize: 15, color: '#64748b' },
  nameText: { fontSize: 26, fontWeight: 'bold', textTransform: 'capitalize' },
  section: { paddingHorizontal: Spacing.four, marginBottom: Spacing.four },
  sectionTitle: { fontWeight: 'bold', marginBottom: Spacing.two, letterSpacing: 0.5 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  heroFinanceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroFinanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  heroSubtitle: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  heroBalance: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFinanceFooter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: Spacing.three,
    alignItems: 'center',
  },
  heroPill: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  heroPillLabel: { color: '#94a3b8', fontSize: 11 },
  heroPillValue: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  heroPillDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: Spacing.three,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
  aiBannerTextContainer: { flex: 1 },
  aiBannerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  aiBannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  horizontalScroll: { paddingBottom: Spacing.two },
  avatarContainer: { alignItems: 'center', marginRight: Spacing.four, width: 64 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  avatarLabel: { textAlign: 'center', fontWeight: '500' },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  emptySubtitle: { textAlign: 'center', marginTop: 4, marginBottom: 12 },
  emptyBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  taskIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  taskTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickActionCard: {
    width: '48%',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  quickActionLabel: { fontWeight: '600', textAlign: 'center' },
  bottomPadding: { height: 30, backgroundColor: 'transparent' },
});
