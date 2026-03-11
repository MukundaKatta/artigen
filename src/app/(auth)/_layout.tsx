import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function AuthLayout() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session && profile) {
      router.replace('/(tabs)');
    }
  }, [session, profile, loading]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </ErrorBoundary>
  );
}
