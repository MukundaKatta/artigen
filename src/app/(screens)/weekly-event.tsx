import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useWeeklyEvent } from '@/hooks/useWeeklyEvent';
import { EventCountdown } from '@/components/events/EventCountdown';
import { formatNumber } from '@/utils/format-number';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { WeeklyEventEntryWithDetails } from '@/services/weekly-event.service';

export default function WeeklyEventRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { event, entries, userVotes, loading, votingEntryId, vote } = useWeeklyEvent(user?.id);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Weekly Event' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Weekly Event' }} />
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="flame-outline" size={28} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No active weekly event</Text>
          <Text style={styles.emptyText}>Check back soon for the next event</Text>
        </View>
      </View>
    );
  }

  function renderEntry({ item, index }: { item: WeeklyEventEntryWithDetails; index: number }) {
    const isVoted = userVotes.has(item.id);
    const media = item.post?.media?.[0];
    const isTop3 = index < 3;

    return (
      <View style={styles.entryCard}>
        {/* Rank */}
        <View style={[styles.rank, isTop3 && styles.rankTop]}>
          <Text style={[styles.rankText, isTop3 && styles.rankTextTop]}>
            {index + 1}
          </Text>
        </View>

        {/* Image */}
        <TouchableOpacity
          onPress={() => router.push(`/(screens)/post/${item.post_id}`)}
          activeOpacity={0.8}
        >
          {media && (
            <Image
              source={{ uri: media.media_url }}
              style={styles.entryImage}
              contentFit="cover"
            />
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.entryInfo}>
          <TouchableOpacity
            style={styles.entryUserRow}
            onPress={() => router.push(`/(screens)/user/${item.user.id}`)}
          >
            <Image
              source={
                item.user.avatar_url
                  ? { uri: item.user.avatar_url }
                  : require('../../../assets/images/default-avatar.png')
              }
              style={styles.entryAvatar}
              contentFit="cover"
            />
            <Text style={styles.entryUsername}>@{item.user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.entryVotes}>{formatNumber(item.vote_count)} votes</Text>
        </View>

        {/* Vote button */}
        <TouchableOpacity
          style={[styles.voteButton, isVoted && styles.voteButtonActive]}
          onPress={() => vote(item.id)}
          disabled={votingEntryId === item.id}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isVoted ? 'heart' : 'heart-outline'}
            size={18}
            color={isVoted ? colors.textLight : colors.like}
          />
        </TouchableOpacity>
      </View>
    );
  }

  function renderHeader() {
    return (
      <View>
        {/* Event info */}
        <View style={styles.eventHeader}>
          <View style={styles.eventBadge}>
            <Ionicons name="flame" size={16} color={colors.warning} />
            <Text style={styles.eventBadgeText}>WEEKLY EVENT</Text>
          </View>
          <Text style={styles.eventTitle}>{event!.title}</Text>
          <Text style={styles.eventTheme}>Theme: {event!.theme}</Text>
          <View style={styles.hashtagRow}>
            <Text style={styles.hashtag}>{event!.hashtag}</Text>
          </View>
          {event!.description && (
            <Text style={styles.eventDescription}>{event!.description}</Text>
          )}

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Ends in</Text>
            <EventCountdown startsAt={event!.ends_at} compact />
          </View>
        </View>

        {/* Leaderboard header */}
        <View style={styles.leaderboardHeader}>
          <Ionicons name="trophy" size={18} color={colors.warning} />
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <Text style={styles.entryCount}>{entries.length} entries</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Weekly Event' }} />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>Be the first to submit your artwork!</Text>
          </View>
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
  list: {
    paddingBottom: spacing.xxxl,
  },
  eventHeader: {
    padding: spacing.lg,
    backgroundColor: colors.warning + '08',
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '20',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  eventBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.warning,
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventTheme: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  hashtagRow: {
    marginBottom: spacing.sm,
  },
  hashtag: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.primary,
  },
  eventDescription: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countdownLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leaderboardTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  entryCount: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTop: {
    backgroundColor: colors.warning + '20',
  },
  rankText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
  },
  rankTextTop: {
    color: colors.warning,
    fontFamily: typography.bold,
  },
  entryImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  entryInfo: {
    flex: 1,
  },
  entryUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  entryAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  entryUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  entryVotes: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  voteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.like + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButtonActive: {
    backgroundColor: colors.like,
    borderColor: colors.like,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
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
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
