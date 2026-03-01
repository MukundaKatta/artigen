import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useMentorship } from '@/hooks/useMentorship';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { MentorshipWithProfiles } from '@/services/mentorship.service';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  active: colors.success,
  completed: colors.primary,
  cancelled: colors.textSecondary,
};

export default function MentorshipRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { mentorships, loading, respond } = useMentorship(user?.id);

  const asMentor = mentorships.filter((m) => m.mentor_id === user?.id);
  const asMentee = mentorships.filter((m) => m.mentee_id === user?.id);

  function renderMentorship({ item }: { item: MentorshipWithProfiles }) {
    const isMentor = item.mentor_id === user?.id;
    const otherUser = isMentor ? item.mentee : item.mentor;
    const isPending = item.status === 'pending' && isMentor;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(screens)/mentorship/${item.id}`)}
        activeOpacity={0.7}
      >
        <Image
          source={
            otherUser.avatar_url
              ? { uri: otherUser.avatar_url }
              : require('../../../assets/images/default-avatar.png')
          }
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {otherUser.username}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '15' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.roleText}>{isMentor ? 'Mentee' : 'Mentor'}</Text>
          </View>
          {item.focus_areas.length > 0 && (
            <Text style={styles.focusAreas} numberOfLines={1}>
              {item.focus_areas.join(', ')}
            </Text>
          )}
        </View>

        {isPending ? (
          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => respond(item.id, true)}
            >
              <Ionicons name="checkmark" size={18} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => respond(item.id, false)}
            >
              <Ionicons name="close" size={18} color={colors.like} />
            </TouchableOpacity>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Mentorship' }} />
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mentorship' }} />
      <FlatList
        data={[...asMentor, ...asMentee]}
        keyExtractor={(item) => item.id}
        renderItem={renderMentorship}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <TouchableOpacity
              style={styles.findButton}
              onPress={() => router.push('/(screens)/mentorship/find')}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={colors.textLight} />
              <Text style={styles.findButtonText}>Find a Mentor</Text>
            </TouchableOpacity>

            {asMentor.length > 0 && (
              <Text style={styles.sectionTitle}>As Mentor ({asMentor.length})</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No mentorships yet</Text>
            <Text style={styles.emptyHint}>Find a mentor to get started</Text>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  findButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    textTransform: 'capitalize',
  },
  roleText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  focusAreas: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.like + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
