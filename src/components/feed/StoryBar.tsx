import React from 'react';
import { View, ScrollView, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider';
import { useStories } from '@/hooks/useStories';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { StoryBarSkeleton } from '@/components/ui/Skeleton';
import { CloseFriendsRing } from '@/components/stories/CloseFriendsRing';
import { useTheme } from '@/providers/ThemeProvider';
import { colors, fontSize, spacing, typography, gradients, shadows } from '@/lib/theme';
import { AVATAR_SIZES } from '@/lib/constants';

const STORY_AVATAR_SIZE = AVATAR_SIZES.lg;
const RING_SIZE = STORY_AVATAR_SIZE + 10;
const GAP = 2;

export function StoryBar() {
  const { profile, user } = useAuth();
  const { stories, loading } = useStories(user?.id);
  const router = useRouter();
  const { themeColors: tc } = useTheme();

  const myStories = stories.find((s) => s.userId === user?.id);
  const otherStories = stories.filter((s) => s.userId !== user?.id);

  if (loading && stories.length === 0) {
    return <StoryBarSkeleton />;
  }

  function handleMyStoryPress() {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (myStories && myStories.stories.length > 0) {
      router.push(`/(stories)/${user?.id}`);
    } else {
      router.push('/(camera)/new-story');
    }
  }

  function handleStoryPress(userId: string) {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(stories)/${userId}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: tc.background, borderBottomColor: tc.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Your Story */}
        <AnimatedPressable scaleValue={0.95} onPress={handleMyStoryPress} style={styles.storyItem}>
          <View>
            <Image
              source={profile?.avatar_url ? { uri: profile.avatar_url } : require('../../../assets/images/default-avatar.png')}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            {(!myStories || myStories.stories.length === 0) && (
              <View style={[styles.addBadge, shadows.sm]}>
                <Ionicons name="add" size={14} color={colors.textLight} />
              </View>
            )}
            {myStories && myStories.stories.length > 0 && (
              <LinearGradient
                colors={gradients.storyRing}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.storyRingGradient}
              >
                <View style={styles.storyRingInner} />
              </LinearGradient>
            )}
          </View>
          <Text style={[styles.label, { color: tc.text }]} numberOfLines={1}>
            Your Story
          </Text>
        </AnimatedPressable>

        {/* Other users' stories */}
        {otherStories.map((userStory) => {
          const hasCloseFriendsStory = userStory.stories.some(
            (s: any) => s.audience === 'close_friends'
          );

          return (
            <AnimatedPressable
              key={userStory.userId}
              scaleValue={0.95}
              onPress={() => handleStoryPress(userStory.userId)}
              style={styles.storyItem}
            >
              <View>
                <Image
                  source={userStory.avatarUrl ? { uri: userStory.avatarUrl } : require('../../../assets/images/default-avatar.png')}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                />
                {userStory.hasUnviewed ? (
                  hasCloseFriendsStory ? (
                    <CloseFriendsRing>
                      <View style={styles.storyRingInner} />
                    </CloseFriendsRing>
                  ) : (
                    <LinearGradient
                      colors={gradients.storyRing}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.storyRingGradient}
                    >
                      <View style={styles.storyRingInner} />
                    </LinearGradient>
                  )
                ) : (
                  <View style={[styles.storyRingViewed, { borderColor: tc.border }]}>
                    <View style={styles.storyRingInner} />
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color: tc.text }]} numberOfLines={1}>
                {userStory.username}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: RING_SIZE + 4,
  },
  avatar: {
    width: STORY_AVATAR_SIZE,
    height: STORY_AVATAR_SIZE,
    borderRadius: STORY_AVATAR_SIZE / 2,
    backgroundColor: colors.backgroundSecondary,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  addBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  storyRingGradient: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: (STORY_AVATAR_SIZE + 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRingInner: {
    width: STORY_AVATAR_SIZE + 2,
    height: STORY_AVATAR_SIZE + 2,
    borderRadius: (STORY_AVATAR_SIZE + 2) / 2,
    backgroundColor: 'transparent',
  },
  storyRingViewed: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: (STORY_AVATAR_SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
