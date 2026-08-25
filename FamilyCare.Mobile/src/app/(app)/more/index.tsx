import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { authService } from '@/services/authService';
import { useTranslation } from '@/i18n';
import { ThemeSwitcherButton } from '@/components/ui/ThemeSwitcherButton';
import { confirmAction } from '@/utils/alerts';

export default function MoreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogout = () => {
    confirmAction(
      t('logout'),
      'Are you sure you want to sign out?',
      async () => {
        await authService.logout();
        router.replace('/login');
      },
      t('logout'),
      t('cancel')
    );
  };

  const renderMenuItem = (
    title: string,
    icon: string,
    onPress: () => void,
    isDestructive = false,
    iconColor?: string
  ) => (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={[styles.menuItem, { backgroundColor: theme.background }]}>
        <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#fee2e2' : '#e0e7ff' }]}>
          <AppIcon
            name={icon}
            tintColor={isDestructive ? '#ef4444' : iconColor || '#667eea'}
            size={22}
          />
        </View>
        <ThemedText
          style={[styles.menuText, isDestructive && { color: '#ef4444', fontWeight: 'bold' }]}
        >
          {title}
        </ThemedText>
        <AppIcon name="chevron.right" tintColor={theme.textSecondary} size={18} />
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="default" style={styles.title}>{t('more')}</ThemedText>
        <ThemeSwitcherButton />
      </ThemedView>

      <View style={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeader}>
          {t('quickActions')}
        </ThemedText>
        {renderMenuItem('Flash AI Assistant', 'bolt.fill', () => router.push('/(app)/more/ai-assistant' as any), false, '#6366f1')}
        {renderMenuItem(t('reminders'), 'bell.fill', () => router.push('/(app)/more/reminders' as any), false, '#f97316')}
        {renderMenuItem(t('locationTracking'), 'mappin.and.ellipse', () => router.push('/(app)/more/location' as any), false, '#3b82f6')}

        <ThemedText type="small" themeColor="textSecondary" style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
          {t('account')} &amp; {t('settings')}
        </ThemedText>
        {renderMenuItem(t('settings'), 'gear', () => router.push('/(app)/more/settings' as any), false, '#64748b')}
        {renderMenuItem(t('logout'), 'arrow.right.square.fill', handleLogout, true)}
      </View>
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
  content: { padding: Spacing.three },
  sectionHeader: {
    marginBottom: Spacing.two,
    marginLeft: Spacing.one,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { flex: 1, marginLeft: Spacing.three, fontSize: 16, fontWeight: '500' },
});
