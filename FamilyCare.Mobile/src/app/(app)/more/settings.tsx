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
import { Spacing } from '@/constants/theme';
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
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AppIcon name="chevron.left" tintColor={theme.text} size={24} />
        </TouchableOpacity>
        <ThemedText type="default" style={styles.title}>
          {t('settings')}
        </ThemedText>
      </ThemedView>

      <View style={styles.content}>
        {/* Account Profile Card */}
        <ThemedView
          style={[styles.profileCard, { backgroundColor: theme.background }]}
        >
          <View style={styles.avatar}>
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
            <View style={styles.roleBadge}>
              <ThemedText style={styles.roleText}>
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
          style={[styles.sectionCard, { backgroundColor: theme.background }]}
        >
          <ThemedText style={styles.settingLabel}>{t('theme')}</ThemedText>
          <View style={styles.segmentedRow}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[
                    styles.segmentButton,
                    isSelected && { backgroundColor: '#667eea' },
                  ]}
                  onPress={() => setThemeMode(opt.mode)}
                >
                  <AppIcon
                    name={opt.icon}
                    tintColor={isSelected ? '#fff' : theme.textSecondary}
                    size={18}
                  />
                  <ThemedText
                    style={[
                      styles.segmentText,
                      isSelected && { color: '#fff', fontWeight: 'bold' },
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
          style={[styles.sectionCard, { backgroundColor: theme.background }]}
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
                    borderTopColor: theme.backgroundSelected,
                  },
                ]}
                onPress={() => setLanguage(opt.code)}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={[
                      styles.languageName,
                      isSelected && { color: '#667eea', fontWeight: 'bold' },
                    ]}
                  >
                    {opt.label}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {opt.sub}
                  </ThemedText>
                </View>
                {isSelected && (
                  <AppIcon
                    name="checkmark.circle.fill"
                    tintColor="#667eea"
                    size={22}
                  />
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
          style={[styles.sectionCard, { backgroundColor: theme.background }]}
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
                borderTopColor: theme.backgroundSelected,
              },
            ]}
          >
            <ThemedText>Backend API</ThemedText>
            <ThemedText type="small" style={{ color: '#10b981', fontWeight: '600' }}>
              Connected (.NET 8.0)
            </ThemedText>
          </View>
        </ThemedView>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AppIcon name="arrow.right.square.fill" tintColor="#ef4444" size={20} />
          <ThemedText style={styles.logoutText}>{t('logout')}</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: 'transparent',
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: Spacing.four, paddingTop: 0 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  avatarText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize' },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  roleText: { color: '#4338ca', fontSize: 12, fontWeight: 'bold' },
  sectionHeader: {
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  sectionCard: {
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.three },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  segmentText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  languageName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    marginTop: Spacing.two,
    marginBottom: Spacing.six,
    gap: 8,
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
