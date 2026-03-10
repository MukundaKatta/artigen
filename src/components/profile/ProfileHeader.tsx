import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { HighlightCircle } from '@/components/profile/HighlightCircle';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { InterestTags } from '@/components/profile/InterestTags';
import { TopFriendsRow } from '@/components/profile/TopFriendsRow';
import { ProfileMusic } from '@/components/profile/ProfileMusic';
import { getHighlights } from '@/services/highlight.service';
import { getTopFriends } from '@/services/profile-customization.service';
import type { HighlightWithStories } from '@/services/highlight.service';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import { SubscriberBadge } from '@/components/profile/SubscriberBadge';
import { StreakBadge } from '@/components/profile/StreakBadge';
import { useStreak } from '@/hooks/useStreak';
import { formatNumber } from '@/utils/format-number';
import type { Profile } from '@/types/database';

type Props = {
  profile: Profile;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollowPress: () => void;
  onEditPress: () => void;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  onHighlightPress?: (highlight: HighlightWithStories) => void;
};

export function ProfileHeader({
  profile,
  isCurrentUser,
  isFollowing,
  followLoading,
  onFollowPress,
  onEditPress,
  onFollowersPress,
  onFollowingPress,
  onReport,
  onBlock,
  onHighlightPress,
}: Props) {
  const [highlights, setHighlights] = useState<HighlightWithStories[]>([]);
  const [topFriends, setTopFriends] = useState<{ id: string; username: string; avatar_url: string | null }[]>([]);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const { streak } = useStreak(profile.id);

  const profileTheme = profile.profile_theme as { accent_color?: string; music_title?: string; music_artist?: string } | null;
  const interestTags = profile.interest_tags;
  const accentColor = profileTheme?.accent_color;

  useEffect(() => {
    getHighlights(profile.id).then(({ data }) => setHighlights(data as HighlightWithStories[]));
    getTopFriends(profile.id).then(({ data }) => {
      if (data) setTopFriends(data || []);
    });
  }, [profile.id]);

  return (
    <View style={[styles.container, accentColor && { borderBottomWidth: 2, borderBottomColor: accentColor }]}>
      {/* Top row: Avatar + Stats */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.topRow}>
        <Avatar uri={profile.avatar_url} size="xl" />
        <View style={styles.stats}>
          <StatItem label="Posts" value={profile.posts_count} />
          <StatItem label="Followers" value={profile.followers_count} onPress={onFollowersPress} />
          <StatItem label="Following" value={profile.following_count} onPress={onFollowingPress} />
          {profile.subscriber_count > 0 && (
            <StatItem label="Subscribers" value={profile.subscriber_count} />
          )}
        </View>
      </Animated.View>

      {/* Name and Bio */}
      <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.fullName}>{profile.full_name}</Text>
          {profile.is_private && (
            <Ionicons name="lock-closed" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          )}
          {profile.is_verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          )}
          {streak && streak.current_streak > 0 && (
            <View style={{ marginLeft: spacing.xs }}>
              <StreakBadge currentStreak={streak.current_streak} />
            </View>
          )}
        </View>
        {profile.is_creator && <SubscriberBadge label="Creator" />}
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        {profile.website ? (
          <Text style={styles.website}>{profile.website}</Text>
        ) : null}
      </Animated.View>

      {/* Interest Tags */}
      {interestTags && interestTags.length > 0 && (
        <InterestTags tags={interestTags} accentColor={accentColor} />
      )}

      {/* Profile Music */}
      {profileTheme?.music_title && (
        <ProfileMusic title={profileTheme.music_title} artist={profileTheme.music_artist} />
      )}

      {/* Top Friends */}
      {topFriends.length > 0 && (
        <TopFriendsRow friends={topFriends} />
      )}

      {/* Action Button */}
      <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.actionRow}>
        {isCurrentUser ? (
          <Button
            title="Edit Profile"
            variant="outline"
            size="sm"
            onPress={onEditPress}
            style={styles.actionButton}
          />
        ) : (
          <View style={styles.otherUserActions}>
            <Button
              title={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'outline' : 'primary'}
              size="sm"
              loading={followLoading}
              onPress={onFollowPress}
              style={styles.followButton}
            />
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setShowMoreSheet(true);
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Story Highlights */}
      {highlights.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.highlightsContainer}
          contentContainerStyle={styles.highlightsContent}
        >
          {highlights.map((h) => (
            <HighlightCircle
              key={h.id}
              highlight={h}
              onPress={() => onHighlightPress?.(h)}
            />
          ))}
        </ScrollView>
      )}

      {/* Report/Block action sheet for other users */}
      <ActionSheet
        visible={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        items={[
          ...(onReport
            ? [{ label: 'Report User', onPress: () => { setShowMoreSheet(false); onReport(); } }]
            : []),
          ...(onBlock
            ? [{ label: `Block @${profile.username}`, destructive: true, onPress: () => { setShowMoreSheet(false); onBlock(); } }]
            : []),
        ]}
      />
    </View>
  );
}

function StatItem({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          onPress();
        }}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={`${formatNumber(value)} ${label}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: 2,
  },
  info: {
    marginTop: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  bio: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: 2,
  },
  website: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.link,
    marginTop: 2,
  },
  actionRow: {
    marginTop: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  otherUserActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  followButton: {
    flex: 1,
  },
  moreButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightsContainer: {
    marginTop: spacing.md,
  },
  highlightsContent: {
    paddingRight: spacing.lg,
  },
});
