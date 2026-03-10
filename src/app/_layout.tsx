import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { useActivityStatus } from '@/hooks/useActivityStatus';
import { useWebNotifications } from '@/hooks/useWebNotifications';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
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

  return (
    <>
      <StatusBar style="dark" />
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
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
