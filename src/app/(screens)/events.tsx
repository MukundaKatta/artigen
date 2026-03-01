import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const STATUS_FILTERS = [
  { key: undefined, label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Past' },
] as const;

export default function EventsRoute() {
  const router = useRouter();
  const { events, loading, statusFilter, filter } = useEvents();

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Events' }} />
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Events' }} />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Create button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(screens)/event/create')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={colors.textLight} />
              <Text style={styles.createButtonText}>Create Event</Text>
            </TouchableOpacity>

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
                  onPress={() => filter(f.key as string | undefined)}
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
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No events found</Text>
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
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
