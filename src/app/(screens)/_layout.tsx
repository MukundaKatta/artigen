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
      <Stack.Screen name="remixes/[postId]" options={{ title: 'Remixes' }} />
      <Stack.Screen name="prompt-library" options={{ title: 'Prompt Library' }} />
      <Stack.Screen name="challenge" options={{ title: 'Daily Challenge' }} />
      <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="community/[id]" options={{ title: '' }} />
      <Stack.Screen name="community/create" options={{ title: 'Create Community' }} />
      <Stack.Screen name="communities" options={{ title: 'Communities' }} />
      <Stack.Screen name="subscription/[creatorId]" options={{ title: 'Subscribe' }} />
      <Stack.Screen name="manage-tiers" options={{ title: 'Manage Tiers' }} />
      <Stack.Screen name="wallet" options={{ title: 'Wallet' }} />
      <Stack.Screen name="wallet-deposit" options={{ title: 'Deposit' }} />
      <Stack.Screen name="wallet-withdraw" options={{ title: 'Withdraw' }} />
      <Stack.Screen name="marketplace/listing/[id]" options={{ title: 'Listing' }} />
      <Stack.Screen name="marketplace/create-listing" options={{ title: 'Create Listing' }} />
      <Stack.Screen name="marketplace/orders" options={{ title: 'Orders' }} />
      <Stack.Screen name="marketplace/order/[id]" options={{ title: 'Order' }} />
      <Stack.Screen name="visual-search" options={{ title: 'Visual Search' }} />
      <Stack.Screen name="taste-profile" options={{ title: 'Your Algorithm' }} />
      <Stack.Screen name="trending" options={{ title: 'Trending' }} />
      <Stack.Screen name="challenge/[id]" options={{ title: 'Challenge' }} />
      <Stack.Screen name="challenges" options={{ title: 'Challenges' }} />
      <Stack.Screen name="badges" options={{ title: 'Badges & Streaks' }} />
      <Stack.Screen name="blend/[id]" options={{ title: 'Blend Feed' }} />
      <Stack.Screen name="provenance/[postId]" options={{ title: 'Art Provenance' }} />
      <Stack.Screen name="safety-settings" options={{ title: 'Content & Safety' }} />
      <Stack.Screen name="collab-invite" options={{ title: 'Invite Collaborator' }} />
      <Stack.Screen name="close-friends" options={{ title: 'Close Friends' }} />
      <Stack.Screen name="scheduled-posts" options={{ title: 'Scheduled Posts' }} />
      <Stack.Screen name="customize-profile" options={{ title: 'Customize Profile' }} />
      <Stack.Screen name="blocked-users" options={{ title: 'Blocked Users' }} />
      <Stack.Screen name="explore-map" options={{ title: 'Explore Map' }} />
    </Stack>
  );
}
