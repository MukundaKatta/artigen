import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const STATUS_FILTERS = [
  { key: undefined, label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Past' },
] as const;

function EventsSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={48} borderRadius={borderRadius.md} />
      <View style={styles.skeletonFilters}>
        <Skeleton width={80} height={32} borderRadius={borderRadius.full} />
        <Skeleton width={60} height={32} borderRadius={borderRadius.full} />
        <Skeleton width={60} height={32} borderRadius={borderRadius.full} />
      </View>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} width="100%" height={120} borderRadius={borderRadius.md} style={{ marginTop: spacing.md }} />
      ))}
    </View>
  );
}

export default function EventsRoute() {
  const router = useRouter();
  const { events, loading, statusFilter, filter } = useEvents();

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Events' }} />
        <View style={styles.list}>
          <EventsSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Events' }} />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)}>
            <EventCard event={item} />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Create button */}
            <Animated.View entering={FadeInUp.duration(400)}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(screens)/event/create');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={colors.textLight} />
                <Text style={styles.createButtonText}>Create Event</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
              style={styles.filters}
            >
              {STATUS_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.label}
                  style={[
                    styles.filterChip,
                    statusFilter === f.key && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    filter(f.key as string | undefined);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      statusFilter === f.key && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>Check back later or create one</Text>
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
  skeletonFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  createButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  filters: {
    marginBottom: spacing.md,
  },
  filtersContent: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textLight,
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
    fontSize: fontSize.xl,
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
