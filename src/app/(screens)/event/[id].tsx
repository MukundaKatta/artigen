import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useEvent } from '@/hooks/useEvent';
import { EventCountdown } from '@/components/events/EventCountdown';
import { formatNumber } from '@/utils/format-number';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const EVENT_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  workshop: 'build-outline',
  ama: 'chatbubbles-outline',
  livestream: 'videocam-outline',
  challenge_event: 'trophy-outline',
  meetup: 'people-outline',
};

export default function EventDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { event, attendees, loading, isAttending, rsvpLoading, rsvp } = useEvent(id, user?.id);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>Event not found</Text>
        </View>
      </View>
    );
  }

  const eventDate = new Date(event.starts_at);
  const isHost = event.host_id === user?.id;
  const isUpcoming = event.status === 'upcoming';
  const isLive = event.status === 'live';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: event.title }} />
      <ScrollView style={styles.scroll}>
        {/* Cover */}
        {event.cover_image_url ? (
          <Image
            source={{ uri: event.cover_image_url }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons
              name={EVENT_TYPE_ICONS[event.event_type] || 'calendar-outline'}
              size={48}
              color={colors.textSecondary}
            />
          </View>
        )}

        {/* Live badge */}
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE NOW</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.eventType}>
            {event.event_type.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & time */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.dateText}>
              {eventDate.toLocaleDateString('en', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.dateText}>
              {eventDate.toLocaleTimeString('en', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {event.ends_at && ` - ${new Date(event.ends_at).toLocaleTimeString('en', {
                hour: '2-digit',
                minute: '2-digit',
              })}`}
            </Text>
          </View>

          {/* Countdown */}
          {isUpcoming && (
            <EventCountdown startsAt={event.starts_at} />
          )}

          {/* Description */}
          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}

          {/* Attendees count */}
          <View style={styles.attendeeRow}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.attendeeText}>
              {formatNumber(event.attendee_count)} attending
              {event.max_attendees && ` / ${event.max_attendees} max`}
            </Text>
          </View>

          {/* Host */}
          <TouchableOpacity
            style={styles.hostRow}
            onPress={() => router.push(`/(screens)/user/${event.host.id}`)}
          >
            <Image
              source={
                event.host.avatar_url
                  ? { uri: event.host.avatar_url }
                  : require('../../../../assets/images/default-avatar.png')
              }
              style={styles.hostAvatar}
              contentFit="cover"
            />
            <View>
              <Text style={styles.hostLabel}>Hosted by</Text>
              <Text style={styles.hostName}>@{event.host.username}</Text>
            </View>
          </TouchableOpacity>

          {/* Meeting link (visible when live or for attendees) */}
          {event.meeting_url && (isLive || isAttending === 'going') && (
            <TouchableOpacity
              style={styles.meetingButton}
              onPress={() => Linking.openURL(event.meeting_url!)}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam" size={18} color={colors.textLight} />
              <Text style={styles.meetingButtonText}>Join Meeting</Text>
            </TouchableOpacity>
          )}

          {/* RSVP buttons */}
          {!isHost && event.status !== 'completed' && event.status !== 'cancelled' && (
            <View style={styles.rsvpSection}>
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  isAttending === 'going' && styles.rsvpButtonActive,
                ]}
                onPress={() => rsvp(isAttending === 'going' ? 'not_going' : 'going')}
                disabled={rsvpLoading}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isAttending === 'going' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color={isAttending === 'going' ? colors.textLight : colors.success}
                />
                <Text
                  style={[
                    styles.rsvpButtonText,
                    isAttending === 'going' && styles.rsvpButtonTextActive,
                  ]}
                >
                  Going
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  isAttending === 'interested' && styles.rsvpButtonInterested,
                ]}
                onPress={() => rsvp(isAttending === 'interested' ? 'not_going' : 'interested')}
                disabled={rsvpLoading}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isAttending === 'interested' ? 'star' : 'star-outline'}
                  size={18}
                  color={isAttending === 'interested' ? colors.textLight : colors.warning}
                />
                <Text
                  style={[
                    styles.rsvpButtonText,
                    isAttending === 'interested' && styles.rsvpButtonTextActive,
                  ]}
                >
                  Interested
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Attendees */}
        {attendees.length > 0 && (
          <View style={styles.attendeesSection}>
            <Text style={styles.sectionTitle}>Attendees</Text>
            <View style={styles.attendeesList}>
              {attendees.slice(0, 10).map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => router.push(`/(screens)/user/${a.user.id}`)}
                >
                  <Image
                    source={
                      a.user.avatar_url
                        ? { uri: a.user.avatar_url }
                        : require('../../../../assets/images/default-avatar.png')
                    }
                    style={styles.attendeeAvatar}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
              {attendees.length > 10 && (
                <View style={styles.moreAttendees}>
                  <Text style={styles.moreAttendeesText}>+{attendees.length - 10}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
    flex: 1,
  },
  cover: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundSecondary,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.like,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
  },
  liveText: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.textLight,
  },
  infoSection: {
    padding: spacing.lg,
  },
  eventType: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  attendeeText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  hostLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  hostName: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  meetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  meetingButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  rsvpSection: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rsvpButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  rsvpButtonInterested: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  rsvpButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  rsvpButtonTextActive: {
    color: colors.textLight,
  },
  attendeesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
  },
  moreAttendees: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAttendeesText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
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
  bottomSpacer: {
    height: spacing.xxxl,
  },
});
