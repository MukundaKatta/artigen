import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useChallenge } from '@/hooks/useChallenge';
import { Avatar } from '@/components/ui/Avatar';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { ChallengeEntryWithDetails } from '@/services/challenge.service';

export default function ChallengeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    todayChallenge,
    entries,
    votedEntryIds,
    loading,
    loadingEntries,
    hasMore,
    loadMoreEntries,
    toggleVote,
  } = useChallenge(user?.id);

  const handleJoinChallenge = useCallback(() => {
    if (!todayChallenge) return;
    router.push({
      pathname: '/(camera)/generate',
      params: {
        challengeTheme: todayChallenge.prompt_theme,
        challengeId: todayChallenge.id,
      },
    });
  }, [todayChallenge, router]);

  const handleEntryPress = useCallback(
    (postId: string) => {
      router.push(`/(screens)/post/${postId}`);
    },
    [router],
  );

  const renderEntry = useCallback(
    ({ item }: { item: ChallengeEntryWithDetails }) => {
      const firstMedia = item.post?.media?.[0];
      const isVoted = votedEntryIds.has(item.id);

      return (
        <TouchableOpacity
          onPress={() => handleEntryPress(item.post?.id || '')}
          activeOpacity={0.8}
        >
          <View style={styles.gridItem}>
            <Image
              source={{ uri: firstMedia?.media_url }}
              style={styles.gridImage}
              contentFit="cover"
            />
            {/* Vote overlay */}
            <View style={styles.voteOverlay}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => toggleVote(item.id)}
                hitSlop={8}
              >
                <Ionicons
                  name={isVoted ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isVoted ? colors.like : '#fff'}
                />
                <Text style={styles.voteCount}>
                  {formatNumber(item.vote_count)}
                </Text>
              </TouchableOpacity>
            </View>
            {/* User avatar badge */}
            <View style={styles.entryUserBadge}>
              <Avatar uri={item.user?.avatar_url} size="sm" />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [votedEntryIds, handleEntryPress, toggleVote],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!todayChallenge) {
    return (
      <View style={styles.container}>
        <View style={styles.noChallengeContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sparkles" size={28} color={colors.textSecondary} />
          </View>
          <Text style={styles.noChallengeText}>No challenge today</Text>
          <Text style={styles.noChallengeSubtext}>Check back tomorrow!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        onEndReached={() => loadMoreEntries(todayChallenge.id)}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Challenge theme card */}
            <View style={styles.challengeCard}>
              <View style={styles.challengeIconRow}>
                <Ionicons name="sparkles" size={24} color="#8B5CF6" />
                <Text style={styles.challengeLabel}>Today's Challenge</Text>
              </View>
              <Text style={styles.challengeTheme}>
                {todayChallenge.prompt_theme}
              </Text>
              {todayChallenge.description ? (
                <Text style={styles.challengeDescription}>
                  {todayChallenge.description}
                </Text>
              ) : null}
              {todayChallenge.style_suggestion ? (
                <View style={styles.styleSuggestionRow}>
                  <Ionicons name="color-palette-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.styleSuggestionText}>
                    Style: {todayChallenge.style_suggestion}
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinChallenge}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.joinButtonText}>Join Challenge</Text>
              </TouchableOpacity>
            </View>

            {/* Entries count */}
            {entries.length > 0 && (
              <Text style={styles.entriesCount}>
                {formatNumber(entries.length)} {entries.length === 1 ? 'entry' : 'entries'}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          loadingEntries && entries.length > 0 ? (
            <View style={styles.footerLoader}>
              <LoadingSpinner />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loadingEntries ? (
            <View style={styles.loader}>
              <LoadingSpinner />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyText}>
                Be the first to join this challenge!
              </Text>
            </View>
          )
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
    marginTop: spacing.xxxl,
    alignItems: 'center',
  },
  // ── Header / Challenge Card ─────────────────────────
  header: {
    marginBottom: POST_GRID_GAP,
  },
  challengeCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  challengeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  challengeLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeTheme: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  challengeDescription: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  styleSuggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  styleSuggestionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#8B5CF6',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  joinButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  entriesCount: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  // ── Grid ────────────────────────────────────────────
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
  voteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteCount: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  entryUserBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  // ── Empty / No Challenge ────────────────────────────
  noChallengeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  noChallengeText: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  noChallengeSubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
