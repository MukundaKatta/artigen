import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function AuthLayout() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect away from onboarding — new users need to complete it
    if (pathname.includes('onboarding')) return;

    if (!loading && session && profile) {
      router.replace('/(tabs)');
    }
  }, [session, profile, loading, pathname]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </ErrorBoundary>
  );
}
