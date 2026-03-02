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
      <Stack.Screen
        name="prompt-library/edit"
        options={{ title: 'New Prompt' }}
      />
      <Stack.Screen
        name="prompt-library/edit/[id]"
        options={{ title: 'Edit Prompt' }}
      />
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
      <Stack.Screen name="music-generator" options={{ title: 'AI Music' }} />
      <Stack.Screen name="sticker-packs" options={{ title: 'Sticker Packs' }} />
      <Stack.Screen name="sticker-pack/[id]" options={{ title: 'Sticker Pack' }} />
      <Stack.Screen name="sticker-pack/create" options={{ title: 'Create Pack' }} />
      <Stack.Screen name="text-to-3d" options={{ title: 'Text to 3D' }} />
      <Stack.Screen name="portfolio/index" options={{ title: 'Portfolio' }} />
      <Stack.Screen name="portfolio/edit" options={{ title: 'Edit Portfolio' }} />
      <Stack.Screen name="cross-post-settings" options={{ title: 'Cross-Post Settings' }} />
      <Stack.Screen name="cross-post/[postId]" options={{ title: 'Cross-Post' }} />
      <Stack.Screen name="ar-preview/[postId]" options={{ title: 'AR Preview' }} />
      <Stack.Screen name="critiques/[postId]" options={{ title: 'Art Critiques' }} />
      <Stack.Screen name="critique/create/[postId]" options={{ title: 'Write Critique' }} />
      <Stack.Screen name="avatar-generator" options={{ title: 'AI Avatars' }} />
      <Stack.Screen name="battles" options={{ title: 'Art Battles' }} />
      <Stack.Screen name="battle/[id]" options={{ title: 'Battle' }} />
      <Stack.Screen name="battle/create" options={{ title: 'Create Battle' }} />
      <Stack.Screen name="workflows" options={{ title: 'Workflows' }} />
      <Stack.Screen name="workflow/[id]" options={{ title: 'Workflow' }} />
      <Stack.Screen name="workflow/create" options={{ title: 'Create Workflow' }} />
      <Stack.Screen name="workflow/run/[id]" options={{ title: 'Workflow Run' }} />
      <Stack.Screen name="tutorials" options={{ title: 'Learn' }} />
      <Stack.Screen name="tutorial/[id]" options={{ title: 'Tutorial' }} />
      <Stack.Screen name="tutorial/lesson/[lessonId]" options={{ title: 'Lesson' }} />
      <Stack.Screen name="mentorship" options={{ title: 'Mentorship' }} />
      <Stack.Screen name="mentorship/find" options={{ title: 'Find a Mentor' }} />
      <Stack.Screen name="mentorship/[id]" options={{ title: 'Mentorship' }} />
      <Stack.Screen name="exhibitions" options={{ title: 'Exhibitions' }} />
      <Stack.Screen name="exhibition/[id]" options={{ title: 'Exhibition' }} />
      <Stack.Screen name="exhibition/create" options={{ title: 'Create Exhibition' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
      <Stack.Screen name="event/[id]" options={{ title: 'Event' }} />
      <Stack.Screen name="event/create" options={{ title: 'Create Event' }} />
      <Stack.Screen name="weekly-event" options={{ title: 'Weekly Event' }} />
      <Stack.Screen name="future-labs" options={{ title: 'Future Labs' }} />
      <Stack.Screen name="transparency-center" options={{ title: 'Transparency Center' }} />
      <Stack.Screen name="localization-studio" options={{ title: 'Localization Studio' }} />
      <Stack.Screen name="spatial-gallery" options={{ title: 'Spatial Gallery' }} />
      <Stack.Screen name="director-mode" options={{ title: 'Director Mode' }} />
      <Stack.Screen name="art-coach/[postId]" options={{ title: 'AI Art Coach' }} />
      <Stack.Screen name="ambient-mode" options={{ headerShown: false }} />
      <Stack.Screen name="art-genetics" options={{ title: 'Art Genetics' }} />
      <Stack.Screen name="buy-credits" options={{ title: 'Buy AI Credits' }} />
      <Stack.Screen name="ai-assistant" options={{ title: 'AI Assistant' }} />
    </Stack>
  );
}
