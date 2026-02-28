import { Stack } from 'expo-router';
import { colors, shadows, typography } from '@/lib/theme';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          ...shadows.sm,
        },
        headerTintColor: colors.text,
        headerBackTitle: '',
        headerTitleStyle: {
          fontFamily: typography.semiBold,
        },
      }}
    >
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
      <Stack.Screen name="user/[id]" options={{ title: '' }} />
      <Stack.Screen name="comments/[postId]" options={{ title: 'Comments' }} />
      <Stack.Screen name="followers/[userId]" options={{ title: 'Followers' }} />
      <Stack.Screen name="following/[userId]" options={{ title: 'Following' }} />
      <Stack.Screen name="hashtag/[name]" options={{ title: '' }} />
    </Stack>
  );
}
