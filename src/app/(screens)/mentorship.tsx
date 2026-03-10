import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useMentorship } from '@/hooks/useMentorship';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { MentorshipWithProfiles } from '@/services/mentorship.service';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  active: colors.success,
  completed: colors.primary,
  cancelled: colors.textSecondary,
};

function MentorshipSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={48} borderRadius={borderRadius.md} />
      <Skeleton width={140} height={18} style={{ marginTop: spacing.lg }} />
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function MentorshipRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { mentorships, loading, respond } = useMentorship(user?.id);

  const asMentor = mentorships.filter((m) => m.mentor_id === user?.id);
  const asMentee = mentorships.filter((m) => m.mentee_id === user?.id);

  function renderMentorship({ item, index }: { item: MentorshipWithProfiles; index: number }) {
    const isMentor = item.mentor_id === user?.id;
    const otherUser = isMentor ? item.mentee : item.mentor;
    const isPending = item.status === 'pending' && isMentor;

    return (
      <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.push(`/(screens)/mentorship/${item.id}`);
          }}
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
            transition={200}
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
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  respond(item.id, true);
                }}
              >
                <Ionicons name="checkmark" size={18} color={colors.textLight} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  respond(item.id, false);
                }}
              >
                <Ionicons name="close" size={18} color={colors.like} />
              </TouchableOpacity>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Mentorship' }} />
        <View style={styles.list}>
          <MentorshipSkeleton />
        </View>
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
            <Animated.View entering={FadeInUp.duration(400)}>
              <TouchableOpacity
                style={styles.findButton}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(screens)/mentorship/find');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={20} color={colors.textLight} />
                <Text style={styles.findButtonText}>Find a Mentor</Text>
              </TouchableOpacity>
            </Animated.View>

            {asMentor.length > 0 && (
              <Text style={styles.sectionTitle}>As Mentor ({asMentor.length})</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No mentorships yet</Text>
            <Text style={styles.emptySubtitle}>Find a mentor to get started</Text>
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
  skeletonContainer: {
    gap: spacing.sm,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
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
});
