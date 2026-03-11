import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastContainer } from '@/components/ui/Toast';
import { NetworkStatusBanner } from '@/components/ui/NetworkStatusBanner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useActivityStatus } from '@/hooks/useActivityStatus';
import { useWebNotifications } from '@/hooks/useWebNotifications';
import { navigateFromDeepLink } from '@/lib/deep-linking';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function AppContent() {
  const { user } = useAuth();
  useActivityStatus(user?.id);
  const { requestPermission } = useWebNotifications();

  useEffect(() => {
    if (Platform.OS === 'web' && user) {
      requestPermission();
    }
  }, [user, requestPermission]);

  // Handle deep links
  useEffect(() => {
    // Handle URL that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) navigateFromDeepLink(url);
    });

    // Listen for incoming deep links while app is open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      navigateFromDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(screens)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(camera)"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(messages)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stories)"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="notifications" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Pacifico_400Regular,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // On web, render immediately — fonts load via CSS @font-face with font-display:auto
  if (!fontsLoaded && Platform.OS !== 'web') return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
            <NetworkStatusBanner />
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
