import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useCommunity } from '@/hooks/useCommunity';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import type { PostWithUser } from '@/types';

function CommunitySkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Banner */}
      <Skeleton width="100%" height={140} borderRadius={0} />
      {/* Avatar + info */}
      <View style={styles.skeletonInfo}>
        <Skeleton width={72} height={72} borderRadius={36} />
        <Skeleton width={180} height={18} style={{ marginTop: spacing.sm }} />
        <Skeleton width={240} height={12} style={{ marginTop: spacing.xs }} />
        <Skeleton width={120} height={12} style={{ marginTop: spacing.xs }} />
      </View>
      {/* Join button */}
      <View style={styles.skeletonActions}>
        <Skeleton width="100%" height={40} borderRadius={borderRadius.md} />
      </View>
      {/* Grid placeholders */}
      <View style={styles.skeletonGrid}>
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
        ))}
      </View>
    </View>
  );
}

export default function CommunityDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    community,
    members,
    feed,
    isMember,
    role,
    loading,
    feedLoading,
    hasMoreFeed,
    joining,
    loadMoreFeed,
    toggleJoin,
  } = useCommunity(id, user?.id);

  const [rulesExpanded, setRulesExpanded] = useState(false);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <CommunitySkeleton />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Community not found</Text>
          <Text style={styles.emptySubtitle}>It may have been removed or doesn't exist</Text>
        </View>
      </View>
    );
  }

  const isOwner = role === 'owner';

  function handlePostPress(postId: string) {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/post/${postId}`);
  }

  function renderPost({ item, index }: { item: PostWithUser; index: number }) {
    const firstMedia = item.media?.[0];
    const isVideo = item.post_type === 'video' || item.post_type === 'reel';
    const isCarousel = (item.media?.length || 0) > 1;

    return (
      <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 30).duration(250)}>
        <TouchableOpacity onPress={() => handlePostPress(item.id)} activeOpacity={0.8}>
          <View style={styles.gridItem}>
            <Image
              source={{ uri: firstMedia?.media_url }}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
            />
            {(isCarousel || isVideo) && (
              <View style={styles.typeIcon}>
                <Ionicons
                  name={isVideo ? 'play' : 'copy-outline'}
                  size={16}
                  color={colors.textLight}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function renderHeader() {
    return (
      <View>
        <CommunityHeader
          community={community!}
          isMember={isMember}
          isOwner={isOwner}
          joining={joining}
          onToggleJoin={toggleJoin}
        />

        {/* Rules Section */}
        {community!.rules.length > 0 && (
          <View style={styles.rulesSection}>
            <TouchableOpacity
              style={styles.rulesHeader}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setRulesExpanded(!rulesExpanded);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.rulesSectionTitle}>Community Rules</Text>
              <Ionicons
                name={rulesExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {rulesExpanded && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.rulesList}>
                {community!.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleNumber}>{index + 1}.</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </View>
        )}

        {/* Members preview */}
        {members.length > 0 && (
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Members</Text>
            <View style={styles.membersRow}>
              {members.slice(0, 5).map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    router.push(`/(screens)/user/${member.user.id}`);
                  }}
                >
                  <Image
                    source={
                      member.user.avatar_url
                        ? { uri: member.user.avatar_url }
                        : require('../../../../assets/images/default-avatar.png')
                    }
                    style={styles.memberAvatar}
                    contentFit="cover"
                    transition={200}
                  />
                </TouchableOpacity>
              ))}
              {members.length > 5 && (
                <View style={styles.moreMembers}>
                  <Text style={styles.moreMembersText}>+{members.length - 5}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Feed header */}
        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>Posts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={renderHeader}
        onEndReached={loadMoreFeed}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          feedLoading ? (
            <View style={styles.skeletonGrid}>
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} width="32%" height={120} borderRadius={2} style={{ flexGrow: 1 }} />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to share something</Text>
            </View>
          )
        }
        ListFooterComponent={
          !feedLoading && hasMoreFeed ? (
            <View style={styles.footerLoader}><LoadingSpinner /></View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonInfo: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skeletonActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
    marginTop: spacing.md,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  rulesSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesSectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  rulesList: {
    marginTop: spacing.sm,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  ruleNumber: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    width: 24,
  },
  ruleText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 18,
  },
  membersSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
  },
  moreMembers: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMembersText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  feedHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  gridRow: {
    gap: POST_GRID_GAP,
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    marginBottom: POST_GRID_GAP,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  typeIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
