import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, Keyboard } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useSpotlightSearch, type SpotlightResult } from '@/hooks/useSpotlightSearch';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

function ResultItem({ item, index, onPress }: { item: SpotlightResult; index: number; onPress: () => void }) {
  const typeColors: Record<string, string> = {
    action: colors.primary,
    screen: colors.accent,
    user: '#10B981',
    community: '#F59E0B',
    post: '#FF6B6B',
    challenge: '#EC4899',
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 30).duration(200)}>
      <AnimatedPressable style={styles.resultItem} onPress={onPress} scaleValue={0.97}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.resultAvatar} contentFit="cover" />
        ) : (
          <View style={[styles.resultIcon, { backgroundColor: (typeColors[item.type] || colors.primary) + '15' }]}>
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={typeColors[item.type] || colors.primary}
            />
          </View>
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function SpotlightScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { query, results, loading, search, clearSearch } = useSpotlightSearch();

  useEffect(() => {
    // Auto-focus and show quick actions
    search('');
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  function handleSelect(item: SpotlightResult) {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    router.push(item.route as never);
  }

  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <AnimatedPressable onPress={() => router.back()} scaleValue={0.9}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search actions, people, communities..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={search}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <AnimatedPressable onPress={clearSearch} scaleValue={0.9}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </AnimatedPressable>
          )}
        </View>
      </View>

      {/* Section Label */}
      <Text style={styles.sectionLabel}>
        {query ? 'Results' : 'Quick Actions'}
      </Text>

      {/* Results */}
      <FlashList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ResultItem item={item} index={index} onPress={() => handleSelect(item)} />
        )}
        estimatedItemSize={64}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          ) : null
        }
      />

      {/* Keyboard shortcut hint */}
      {Platform.OS === 'web' && (
        <View style={styles.shortcutHint}>
          <Text style={styles.shortcutText}>Tip: Press Cmd+K anywhere to open Spotlight</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    paddingVertical: spacing.sm + 2,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  resultSubtitle: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  shortcutHint: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  shortcutText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
