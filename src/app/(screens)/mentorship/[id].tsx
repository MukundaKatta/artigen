import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getMyMentorships,
  getMentorshipSessions,
  addSession,
  respondToMentorship,
} from '@/services/mentorship.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type {
  MentorshipWithProfiles,
  MentorshipSessionWithPost,
} from '@/services/mentorship.service';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  active: colors.success,
  completed: colors.primary,
  cancelled: colors.textSecondary,
};

export default function MentorshipDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [mentorship, setMentorship] = useState<MentorshipWithProfiles | null>(null);
  const [sessions, setSessions] = useState<MentorshipSessionWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id || !user?.id) return;

      // Fetch mentorship details from the list
      const { data: all } = await getMyMentorships(user.id);
      const found = all.find((m) => m.id === id);
      setMentorship(found || null);
      setLoading(false);

      // Fetch sessions
      const { data: sessionData } = await getMentorshipSessions(id);
      setSessions(sessionData);
      setSessionsLoading(false);
    })();
  }, [id, user?.id]);

  const handleAddSession = useCallback(async () => {
    if (!id || !feedback.trim() || submitting) return;

    setSubmitting(true);
    const { data, error } = await addSession(id, feedback.trim());
    if (data && !error) {
      setSessions((prev) => [data, ...prev]);
      setFeedback('');
    } else {
      Alert.alert('Error', 'Failed to add feedback session.');
    }
    setSubmitting(false);
  }, [id, feedback, submitting]);

  const handleRespond = useCallback(
    async (accept: boolean) => {
      if (!id) return;
      const { data } = await respondToMentorship(id, accept);
      if (data) setMentorship(data);
    },
    [id],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!mentorship) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Mentorship not found</Text>
        </View>
      </View>
    );
  }

  const isMentor = mentorship.mentor_id === user?.id;
  const otherUser = isMentor ? mentorship.mentee : mentorship.mentor;
  const isPending = mentorship.status === 'pending' && isMentor;

  function renderSession({ item }: { item: MentorshipSessionWithPost }) {
    return (
      <View style={styles.sessionCard}>
        <Text style={styles.sessionFeedback}>{item.feedback}</Text>
        {item.rating && (
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating! ? 'star' : 'star-outline'}
                size={14}
                color={colors.warning}
              />
            ))}
          </View>
        )}
        <Text style={styles.sessionDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  }

  function renderHeader() {
    if (!mentorship) return null;
    return (
      <View>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => router.push(`/(screens)/user/${otherUser.id}`)}>
            <Image
              source={
                otherUser.avatar_url
                  ? { uri: otherUser.avatar_url }
                  : require('../../../../assets/images/default-avatar.png')
              }
              style={styles.avatar}
              contentFit="cover"
            />
          </TouchableOpacity>
          <Text style={styles.profileName}>{otherUser.username}</Text>
          <Text style={styles.profileRole}>{isMentor ? 'Your Mentee' : 'Your Mentor'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[mentorship.status] + '15' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[mentorship.status] }]}>
              {mentorship.status}
            </Text>
          </View>
        </View>

        {/* Focus areas */}
        {mentorship.focus_areas.length > 0 && (
          <View style={styles.focusSection}>
            <Text style={styles.focusSectionTitle}>Focus Areas</Text>
            <View style={styles.focusTags}>
              {mentorship.focus_areas.map((area: string) => (
                <View key={area} style={styles.focusTag}>
                  <Text style={styles.focusTagText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Message */}
        {mentorship.message && (
          <View style={styles.messageSection}>
            <Text style={styles.messageSectionTitle}>Request Message</Text>
            <Text style={styles.messageText}>{mentorship.message}</Text>
          </View>
        )}

        {/* Pending actions */}
        {isPending && (
          <View style={styles.pendingSection}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleRespond(true)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => handleRespond(false)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add feedback (mentor only, active mentorship) */}
        {isMentor && mentorship.status === 'active' && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Add Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write feedback for your mentee..."
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.submitButton, (!feedback.trim() || submitting) && styles.submitButtonDisabled]}
              onPress={handleAddSession}
              disabled={!feedback.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Sessions header */}
        <View style={styles.sessionsHeader}>
          <Text style={styles.sessionsTitle}>Feedback Sessions ({sessions.length})</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mentorship' }} />
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          sessionsLoading ? (
            <LoadingSpinner size="small" color={colors.primary} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No sessions yet</Text>
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
  list: {
    paddingBottom: spacing.xxxl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  profileRole: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    textTransform: 'capitalize',
  },
  focusSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  focusSectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  focusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  focusTag: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  focusTagText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  messageSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  messageSectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pendingSection: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  declineButton: {
    flex: 1,
    backgroundColor: colors.like + '15',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.like,
  },
  feedbackSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  feedbackTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  sessionsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sessionsTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  sessionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  sessionFeedback: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: spacing.sm,
  },
  sessionDate: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  },
});
