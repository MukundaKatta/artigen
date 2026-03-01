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
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTutorials } from '@/hooks/useTutorials';
import { useXp } from '@/hooks/useXp';
import { TutorialCard } from '@/components/learning/TutorialCard';
import { XpBar } from '@/components/learning/XpBar';
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

export default function TutorialsRoute() {
  const { user } = useAuth();
  const { tutorials, progressMap, loading, category, filterByCategory } = useTutorials(user?.id);
  const { xp, level, xpToNext } = useXp(user?.id);

  function renderHeader() {
    return (
      <View>
        {/* XP Bar */}
        {xp && (
          <View style={styles.xpSection}>
            <XpBar totalXp={xp.total_xp} level={level} xpToNext={xpToNext} />
          </View>
        )}

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[
                styles.categoryChip,
                category === cat.key && styles.categoryChipActive,
              ]}
              onPress={() => filterByCategory(cat.key as string | undefined)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.key && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
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
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Learn' }} />
      <FlatList
        data={tutorials}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TutorialCard
              tutorial={item}
              progress={progressMap[item.id]}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No tutorials available</Text>
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
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
