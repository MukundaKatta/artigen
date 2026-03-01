import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopMessagesLayout } from '@/components/messages/DesktopMessagesLayout';

export default function MessagesLayout() {
  const { isMobile } = useResponsive();

  // Desktop: wrap in split-pane layout
  if (Platform.OS === 'web' && !isMobile) {
    return (
      <DesktopMessagesLayout>
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
      </DesktopMessagesLayout>
    );
  }

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
