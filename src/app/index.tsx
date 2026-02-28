import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function IndexRoute() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (session) {
      // User is logged in, go to main app
      router.replace('/(tabs)');
    } else {
      // User is not logged in, go to auth
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  return <LoadingSpinner fullScreen />;
}
