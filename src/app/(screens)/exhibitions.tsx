import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useExhibitions } from '@/hooks/useExhibitions';
import { ExhibitionCard } from '@/components/exhibitions/ExhibitionCard';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const STATUS_FILTERS = [
  { key: undefined, label: 'All' },
  { key: 'accepting', label: 'Open' },
  { key: 'curating', label: 'Curating' },
  { key: 'live', label: 'Live' },
  { key: 'archived', label: 'Archived' },
] as const;

export default function ExhibitionsRoute() {
  const router = useRouter();
  const { exhibitions, loading, statusFilter, filter } = useExhibitions();

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Exhibitions' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Exhibitions' }} />
      <FlatList
        data={exhibitions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExhibitionCard exhibition={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Create button */}
            <AnimatedPressable
              style={styles.createButton}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(screens)/exhibition/create');
              }}
              scaleValue={0.97}
            >
              <Ionicons name="add" size={20} color={colors.textLight} />
              <Text style={styles.createButtonText}>Create Exhibition</Text>
            </AnimatedPressable>

            {/* Status filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
              style={styles.filters}
            >
              {STATUS_FILTERS.map((f) => (
                <AnimatedPressable
                  key={f.label}
                  style={[
                    styles.filterChip,
                    statusFilter === f.key && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    filter(f.key as string | undefined);
                  }}
                  scaleValue={0.92}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      statusFilter === f.key && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No exhibitions yet</Text>
            <Text style={styles.emptyText}>Create one to showcase curated artwork</Text>
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
