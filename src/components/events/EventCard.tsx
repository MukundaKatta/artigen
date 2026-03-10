import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { AppEventWithHost } from '@/services/event.service';

type Props = {
  event: AppEventWithHost;
};

const EVENT_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  workshop: 'build-outline',
  ama: 'chatbubbles-outline',
  livestream: 'videocam-outline',
  challenge_event: 'trophy-outline',
  meetup: 'people-outline',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  ama: 'AMA',
  livestream: 'Livestream',
  challenge_event: 'Challenge',
  meetup: 'Meetup',
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: colors.primary,
  live: colors.like,
  completed: colors.textSecondary,
  cancelled: colors.textSecondary,
};

export function EventCard({ event }: Props) {
  const router = useRouter();

  function handlePress() {
    router.push(`/(screens)/event/${event.id}`);
  }

  const eventDate = new Date(event.starts_at);
  const isLive = event.status === 'live';

  return (
    <AnimatedPressable
      style={styles.card}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        handlePress();
      }}
      scaleValue={0.97}
      accessibilityLabel={`${event.title} - ${event.status} event by ${event.host.username}`}
      accessibilityRole="button"
    >
      {/* Left: date */}
      <View style={styles.dateColumn}>
        <Text style={styles.dateMonth}>
          {eventDate.toLocaleString('en', { month: 'short' }).toUpperCase()}
        </Text>
        <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
      </View>

      {/* Center: info */}
      <View style={styles.info}>
        <View style={styles.typeRow}>
          <Ionicons
            name={EVENT_TYPE_ICONS[event.event_type] || 'calendar-outline'}
            size={12}
            color={colors.primary}
          />
          <Text style={styles.typeText}>
            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
          </Text>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            {formatNumber(event.attendee_count)} attending
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>@{event.host.username}</Text>
        </View>
      </View>

      {/* Right: RSVP indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[event.status] + '15' }]}>
        <Ionicons
          name={isLive ? 'radio' : 'calendar-outline'}
          size={16}
          color={STATUS_COLORS[event.status]}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  dateColumn: {
    width: 44,
    alignItems: 'center',
  },
  dateMonth: {
    fontSize: fontSize.xs,
    fontFamily: typography.bold,
    color: colors.primary,
  },
  dateDay: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    lineHeight: 28,
  },
  info: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  typeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.like + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.like,
  },
  liveText: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: colors.like,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
