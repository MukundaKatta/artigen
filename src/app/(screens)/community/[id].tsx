import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useCommunity } from '@/hooks/useCommunity';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import type { PostWithUser } from '@/types';

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
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>Community not found</Text>
        </View>
      </View>
    );
  }

  const isOwner = role === 'owner';

  function handlePostPress(postId: string) {
    router.push(`/(screens)/post/${postId}`);
  }

  function renderPost({ item }: { item: PostWithUser }) {
    const firstMedia = item.media?.[0];
    const isVideo = item.post_type === 'video' || item.post_type === 'reel';
    const isCarousel = (item.media?.length || 0) > 1;

    return (
      <TouchableOpacity onPress={() => handlePostPress(item.id)} activeOpacity={0.8}>
        <View style={styles.gridItem}>
          <Image
            source={{ uri: firstMedia?.media_url }}
            style={styles.gridImage}
            contentFit="cover"
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
              onPress={() => setRulesExpanded(!rulesExpanded)}
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
              <View style={styles.rulesList}>
                {community!.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleNumber}>{index + 1}.</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
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
                  onPress={() => router.push(`/(screens)/user/${member.user.id}`)}
                >
                  <Image
                    source={
                      member.user.avatar_url
                        ? { uri: member.user.avatar_url }
                        : require('../../../../assets/images/default-avatar.png')
                    }
                    style={styles.memberAvatar}
                    contentFit="cover"
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
            <ActivityIndicator style={styles.feedLoader} color={colors.primary} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="images-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )
        }
        ListFooterComponent={
          !feedLoading && hasMoreFeed ? (
            <ActivityIndicator style={styles.footerLoader} color={colors.primary} />
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
  loader: {
    paddingVertical: spacing.xxxl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  rulesSection: {
    borderTopWidth: 1,
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
    borderTopWidth: 1,
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
    borderTopWidth: 1,
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
  feedLoader: {
    paddingVertical: spacing.xxxl,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
