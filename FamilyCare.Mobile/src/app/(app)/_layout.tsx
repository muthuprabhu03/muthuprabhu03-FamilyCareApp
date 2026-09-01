import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';
import { Shadows } from '@/constants/theme';

export default function AppLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          height: Platform.select({ ios: 82, android: 68, default: 68 }),
          paddingBottom: Platform.select({ ios: 24, android: 10, default: 10 }),
          paddingTop: 8,
          ...Shadows.soft,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'house.fill' : 'house'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: t('family'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'person.2.fill' : 'person.2'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: t('finance'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'dollarsign.circle.fill' : 'dollarsign.circle'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: t('health'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'cross.case.fill' : 'cross.case'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'Flash AI',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'bolt.fill' : 'bolt.circle'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'gearshape.fill' : 'gearshape'}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          href: null, // Hide internal more screen from tab bar since AI & Settings are now direct tabs
        }}
      />
    </Tabs>
  );
}
