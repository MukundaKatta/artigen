import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { useTutorials } from '@/hooks/useTutorials';
import { useXp } from '@/hooks/useXp';
import { TutorialCard } from '@/components/learning/TutorialCard';
import { XpBar } from '@/components/learning/XpBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const CATEGORIES = [
  { key: undefined, label: 'All' },
  { key: 'basics', label: 'Basics' },
  { key: 'prompting', label: 'Prompting' },
  { key: 'styles', label: 'Styles' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'models', label: 'Models' },
  { key: 'composition', label: 'Composition' },
] as const;

function TutorialsSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={48} borderRadius={borderRadius.md} style={{ margin: spacing.lg }} />
      <View style={styles.skeletonFilters}>
        {[80, 60, 80, 60, 70].map((w, i) => (
          <Skeleton key={i} width={w} height={32} borderRadius={borderRadius.full} />
        ))}
      </View>
      <View style={styles.skeletonGrid}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} width="47%" height={140} borderRadius={borderRadius.md} />
        ))}
      </View>
    </View>
  );
}

export default function TutorialsRoute() {
  const { user } = useAuth();
  const { tutorials, progressMap, loading, category, filterByCategory } = useTutorials(user?.id);
  const { xp, level, xpToNext } = useXp(user?.id);

  function renderHeader() {
    return (
      <View>
        {/* XP Bar */}
        {xp && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.xpSection}>
            <XpBar totalXp={xp.total_xp} level={level} xpToNext={xpToNext} />
          </Animated.View>
        )}

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <AnimatedPressable
              key={cat.label}
              style={[
                styles.categoryChip,
                category === cat.key ? styles.categoryChipActive : undefined,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                filterByCategory(cat.key as string | undefined);
              }}
              scaleValue={0.92}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.key && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Tutorials` : 'All Tutorials'}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Learn' }} />
        <TutorialsSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Learn' }} />
      <FlatList
        data={tutorials}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)} style={styles.cardWrapper}>
            <TutorialCard
              tutorial={item}
              progress={progressMap[item.id]}
            />
          </Animated.View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="school-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No tutorials available</Text>
            <Text style={styles.emptySubtitle}>Check back soon for new content</Text>
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
  skeletonContainer: {
    flex: 1,
  },
  skeletonFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  xpSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  categories: {
    marginBottom: spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
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
