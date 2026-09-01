import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { LanguageProvider } from '@/i18n';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isDark } = useAppTheme();

  useEffect(() => {
    notificationService.initialize();

    // Handle user tapping on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.url) {
        router.push(data.url as any);
      }
    });

    const checkAuth = async () => {
      const loggedIn = await authService.isLoggedIn();
      
      const segmentsStr = segments as string[];
      const inAuthGroup = segmentsStr[0] === 'login';
      
      if (!loggedIn && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/login');
      } else if (loggedIn && (inAuthGroup || segmentsStr.length === 0 || segmentsStr[0] === 'index')) {
        // Redirect to dashboard if authenticated and trying to access login or root
        router.replace('/(app)' as any);
      }
      
      setIsReady(true);
    };

    checkAuth();

    return () => {
      responseListener.remove();
    };
  }, [segments]);

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="index" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <LanguageProvider>
        <RootNavigation />
      </LanguageProvider>
    </AppThemeProvider>
  );
}
