import { Tabs } from 'expo-router';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export default function AppLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.backgroundSelected,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
        name="more"
        options={{
          title: t('more'),
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
    </Tabs>
  );
}
