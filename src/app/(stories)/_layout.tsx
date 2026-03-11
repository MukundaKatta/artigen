import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function StoriesLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[userId]" />
      </Stack>
    </ErrorBoundary>
  );
}
