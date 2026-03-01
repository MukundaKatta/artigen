import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Messages' }} />
      <Stack.Screen name="[conversationId]" options={{ title: '' }} />
      <Stack.Screen name="new" options={{ title: 'New Message' }} />
      <Stack.Screen name="new-group" options={{ title: 'New Group' }} />
    </Stack>
  );
}
