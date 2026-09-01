import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { useAppTheme, ThemeMode } from '@/context/ThemeContext';
import { useTranslation, Language } from '@/i18n';
import { authService } from '@/services/authService';
import { User } from '@/types/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode } = useAppTheme();
  const { language, setLanguage, t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getUser().then(setUser);
  }, []);

  const handleLogout = () => {
    Alert.alert(t('logout'), 'Are you sure you want to sign out?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const themeOptions: { mode: ThemeMode; labelKey: any; icon: string }[] = [
    { mode: 'system', labelKey: 'system', icon: 'gear' },
    { mode: 'light', labelKey: 'light', icon: 'sun.max.fill' },
    { mode: 'dark', labelKey: 'dark', icon: 'moon.fill' },
  ];

  const languageOptions: { code: Language; label: string; sub: string }[] = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'ta', label: 'தமிழ் (Tamil)', sub: 'தமிழ் மொழி' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          activeOpacity={0.7}
        >
          <AppIcon name="chevron.left" tintColor={theme.text} size={20} />
        </TouchableOpacity>
        <ThemedText type="default" style={styles.title}>
          {t('settings')}
        </ThemedText>
      </ThemedView>

      <View style={styles.content}>
        {/* Account Profile Card */}
        <ThemedView
          style={[
            styles.profileCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.avatarText}>
              {user?.email.charAt(0).toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {user?.email.split('@')[0] || 'User'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.email || ''}
            </ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: theme.purpleBg }]}>
              <ThemedText style={[styles.roleText, { color: theme.primary }]}>
                {user?.role || 'Family Admin'}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Appearance & Theme */}
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.sectionHeader}
        >
          {t('appearance')}
        </ThemedText>
        <ThemedView
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            Shadows.soft,
          ]}
        >
          <ThemedText style={styles.settingLabel}>{t('theme')}</ThemedText>
          <View style={[styles.segmentedRow, { backgroundColor: theme.backgroundElement }]}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[
                    styles.segmentButton,
                    isSelected && [
                      styles.segmentButtonActive,
                      { backgroundColor: theme.primary },
                      Shadows.soft,
                    ],
                  ]}
                  onPress={() => setThemeMode(opt.mode)}
                  activeOpacity={0.8}
                >
                  <AppIcon
                    name={opt.icon}
                    tintColor={isSelected ? '#fff' : theme.textSecondary}
                    size={16}
                  />
                  <ThemedText
                    style={[
                      styles.segmentText,
                      {
                        color: isSelected ? '#fff' : theme.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {t(opt.labelKey)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedView>

        {/* Language Selection */}
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.sectionHeader}
        >
          {t('language')}
        </ThemedText>
        <ThemedView
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            Shadows.soft,
          ]}
        >
          {languageOptions.map((opt, index) => {
            const isSelected = language === opt.code;
            return (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.languageRow,
                  index > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.cardBorder,
                  },
                ]}
                onPress={() => setLanguage(opt.code)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[
                      styles.languageName,
                      isSelected && { color: theme.primary, fontWeight: '700' },
                    ]}
                  >
                    {opt.label}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {opt.sub}
                  </ThemedText>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: theme.purpleBg }]}>
                    <AppIcon
                      name="checkmark.circle.fill"
                      tintColor={theme.primary}
                      size={22}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ThemedView>

        {/* App Info & Version */}
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.sectionHeader}
        >
          {t('appInfo')}
        </ThemedText>
        <ThemedView
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={styles.infoRow}>
            <ThemedText>{t('version')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              v1.2.0 (Production)
            </ThemedText>
          </View>
          <View
            style={[
              styles.infoRow,
              {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: theme.cardBorder,
              },
            ]}
          >
            <ThemedText>Backend API</ThemedText>
            <View style={styles.apiStatusBadge}>
              <View style={styles.apiStatusDot} />
              <ThemedText type="small" style={{ color: theme.success, fontWeight: '700' }}>
                Connected (.NET 8.0)
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.dangerBg,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            },
          ]}
          activeOpacity={0.8}
        >
          <AppIcon name="arrow.right.square.fill" tintColor={theme.danger} size={20} />
          <ThemedText style={[styles.logoutText, { color: theme.danger }]}>{t('logout')}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.two,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
    borderWidth: 1,
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  content: { padding: Spacing.four, paddingTop: Spacing.two },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.xl,
    marginBottom: Spacing.four,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', textTransform: 'capitalize' },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700' },
  sectionHeader: {
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 11,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
  },
  settingLabel: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.three },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radius.sm,
    gap: 6,
  },
  segmentButtonActive: {},
  segmentText: { fontSize: 13 },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  languageName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  apiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    marginTop: Spacing.two,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});
