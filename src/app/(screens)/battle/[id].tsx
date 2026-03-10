import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBattle } from '@/hooks/useBattle';
import { BattleArena } from '@/components/battles/BattleArena';
import { BattleTimer } from '@/components/battles/BattleTimer';
import { BattleVoteButton } from '@/components/battles/BattleVoteButton';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function BattleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    battle,
    entries,
    userVote,
    loading,
    voting,
    join,
    vote,
    refresh,
  } = useBattle(id, user?.id);

  const isCreator = battle?.creator_id === user?.id;
  const isOpponent = battle?.opponent_id === user?.id;
  const isParticipant = isCreator || isOpponent;
  const canJoin = battle?.status === 'waiting' && !isCreator && !battle.opponent_id;
  const canVote = battle?.status === 'voting' && !isParticipant;

  const handleJoin = useCallback(async () => {
    const { error } = (await join()) || {};
    if (error) {
      Alert.alert('Error', 'Failed to join battle.');
    }
  }, [join]);

  const handleVote = useCallback(
    (entryId: string) => {
      vote(entryId);
    },
    [vote],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Battle' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!battle) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Battle' }} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="flash-off-outline" size={28} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Battle not found</Text>
          <Text style={styles.emptyText}>This battle may have ended or been removed</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: battle.title }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Theme header */}
        <View style={styles.header}>
          <Text style={styles.title}>{battle.title}</Text>
          <Text style={styles.theme}>Theme: {battle.theme}</Text>
          {battle.description && (
            <Text style={styles.description}>{battle.description}</Text>
          )}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <BattleTimer
            startedAt={battle.started_at}
            timeLimitMinutes={battle.time_limit_minutes}
            status={battle.status}
          />
        </View>

        {/* Arena - side by side entries */}
        <BattleArena entries={entries} />

        {/* Vote buttons (during voting phase) */}
        {canVote && entries.length > 0 && (
          <View style={styles.voteRow}>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.voteCol}>
                <BattleVoteButton
                  entryId={entry.id}
                  voteCount={entry.vote_count}
                  isVoted={userVote?.entry_id === entry.id}
                  disabled={voting}
                  onPress={handleVote}
                />
              </View>
            ))}
          </View>
        )}

        {/* Voting results (when not a voter) */}
        {battle.status === 'voting' && isParticipant && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Voting is in progress. Participants cannot vote on their own battle.
            </Text>
          </View>
        )}

        {/* Join button */}
        {canJoin && (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin} activeOpacity={0.7}>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Join Battle</Text>
          </TouchableOpacity>
        )}

        {/* Winner announcement */}
        {battle.status === 'completed' && (
          <View style={styles.resultCard}>
            <Ionicons name="trophy" size={32} color={colors.warning} />
            {battle.winner ? (
              <View style={styles.winnerRow}>
                <Avatar uri={battle.winner.avatar_url} size="md" />
                <View>
                  <Text style={styles.winnerLabel}>Winner</Text>
                  <Text style={styles.winnerName}>{battle.winner.username}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.tieText}>It's a tie!</Text>
            )}
          </View>
        )}

        {/* Entries prompts */}
        {entries.length > 0 && (
          <View style={styles.promptsSection}>
            <Text style={styles.sectionTitle}>Prompts Used</Text>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.promptCard}>
                <View style={styles.promptHeader}>
                  <Avatar uri={entry.user?.avatar_url} size="sm" />
                  <Text style={styles.promptUsername}>{entry.user?.username}</Text>
                </View>
                <Text style={styles.promptText}>{entry.prompt_used || 'No prompt recorded'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  theme: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  voteCol: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.primary,
    lineHeight: 18,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  joinButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  resultCard: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  winnerLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  winnerName: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  tieText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  promptsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  promptCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  promptUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  promptText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
