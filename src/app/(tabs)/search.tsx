import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { UserRowSkeleton } from '@/components/ui/Skeleton';
import { MasonryGrid } from '@/components/explore/MasonryGrid';
import { VisualSearchButton } from '@/components/search/VisualSearchButton';
import { TrendingPromptsSection } from '@/components/search/TrendingPromptsSection';
import { TrendingStyleChips } from '@/components/search/TrendingStyleChips';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useExplore } from '@/hooks/useExplore';
import { useTrending } from '@/hooks/useTrending';
import { useTheme } from '@/providers/ThemeProvider';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { spacing, fontSize, borderRadius, typography } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { PostWithUser } from '@/types';

type SearchTab = 'users' | 'tags' | 'posts' | 'prompts';

const SEARCH_TABS = [
  { key: 'users', label: 'Users' },
  { key: 'tags', label: 'Tags' },
  { key: 'posts', label: 'Posts' },
  { key: 'prompts', label: 'Prompts' },
];

function SearchSkeleton() {
  return (
    <View style={{ paddingTop: spacing.md }}>
      {[...Array(5)].map((_, i) => (
        <UserRowSkeleton key={i} />
      ))}
    </View>
  );
}

export default function SearchRoute() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { themeColors } = useTheme();
  const {
    query,
    isSearching,
    explorePosts,
    searchResultUsers,
    searchResultPosts,
    searchResultHashtags,
    searchResultPrompts,
    loading,
    searching,
    loadingMore,
    aiOnly,
    search,
    clearSearch,
    loadMore,
    toggleAiOnly,
  } = useExplore();
  const { prompts: trendingPrompts, styles: trendingStyles } = useTrending();
  const [activeTab, setActiveTab] = useState<SearchTab>('users');

  // Animated search bar focus
  const searchBarScale = useSharedValue(1);
  const searchBarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const handleFocus = useCallback(() => {
    searchBarScale.value = withTiming(1.02, { duration: 150, easing: Easing.out(Easing.ease) });
  }, [searchBarScale]);

  const handleBlur = useCallback(() => {
    searchBarScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
  }, [searchBarScale]);

  const handlePostPress = useCallback((postId: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/post/${postId}`);
  }, [router]);

  const handleUserPress = useCallback((userId: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/user/${userId}`);
  }, [router]);

  const handleHashtagPress = useCallback((name: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/hashtag/${name}`);
  }, [router]);

  // Explore grid item
  const renderExploreItem = useCallback(({ item }: { item: PostWithUser }) => {
    const firstMedia = item.media?.[0];
    const isVideo = item.post_type === 'video' || item.post_type === 'reel';
    const isCarousel = (item.media?.length || 0) > 1;
    const isAi = !!(item as any).ai_metadata;

    return (
      <AnimatedPressable
        onPress={() => handlePostPress(item.id)}
        scaleValue={0.97}
      >
        <View style={styles.gridItem}>
          <Image
            source={{ uri: firstMedia?.media_url }}
            placeholder={firstMedia?.blurhash ? { blurhash: firstMedia.blurhash } : undefined}
            style={[styles.gridImage, { backgroundColor: themeColors.backgroundSecondary }]}
            contentFit="cover"
            transition={200}
          />
          {isAi && (
            <View style={[styles.typeIcon, styles.aiIcon]}>
              <Ionicons name="sparkles" size={14} color="#fff" />
            </View>
          )}
          {(isCarousel || isVideo) && (
            <View style={styles.typeIcon}>
              <Ionicons
                name={isVideo ? 'play' : 'copy-outline'}
                size={16}
                color="#fff"
              />
            </View>
          )}
        </View>
      </AnimatedPressable>
    );
  }, [handlePostPress, themeColors]);

  // Search result renderers
  const renderUserItem = useCallback(({ item }: { item: (typeof searchResultUsers)[0] }) => {
    return (
      <AnimatedPressable
        style={styles.userRow}
        onPress={() => handleUserPress(item.id)}
        scaleValue={0.98}
      >
        <Avatar uri={item.avatar_url} size="md" />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: themeColors.text }]}>{item.username}</Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={14} color={themeColors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={[styles.fullName, { color: themeColors.textSecondary }]} numberOfLines={1}>{item.full_name}</Text>
        </View>
      </AnimatedPressable>
    );
  }, [handleUserPress, themeColors]);

  const renderHashtagItem = useCallback(({ item }: { item: { id: string; name: string; post_count: number } }) => {
    return (
      <AnimatedPressable
        style={styles.userRow}
        onPress={() => handleHashtagPress(item.name)}
        scaleValue={0.98}
      >
        <View style={[styles.hashtagIcon, { borderColor: themeColors.border }]}>
          <Text style={[styles.hashSymbol, { color: themeColors.text }]}>#</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: themeColors.text }]}>#{item.name}</Text>
          <Text style={[styles.fullName, { color: themeColors.textSecondary }]}>{formatNumber(item.post_count)} posts</Text>
        </View>
      </AnimatedPressable>
    );
  }, [handleHashtagPress, themeColors]);

  const renderSearchPostItem = useCallback(({ item }: { item: PostWithUser }) => {
    const firstMedia = item.media?.[0];
    const isAi = !!(item as any).ai_metadata;
    return (
      <AnimatedPressable
        style={styles.userRow}
        onPress={() => handlePostPress(item.id)}
        scaleValue={0.98}
      >
        <Image
          source={{ uri: firstMedia?.media_url }}
          style={[styles.postThumbnail, { backgroundColor: themeColors.backgroundSecondary }]}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: themeColors.text }]}>{item.user?.username}</Text>
            {isAi && (
              <View style={[styles.aiBadgeSmall, { backgroundColor: themeColors.accent }]}>
                <Ionicons name="sparkles" size={8} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.fullName, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {item.caption || 'No caption'}
          </Text>
        </View>
      </AnimatedPressable>
    );
  }, [handlePostPress, themeColors]);

  const renderPromptItem = useCallback(({ item }: { item: PostWithUser }) => {
    const firstMedia = item.media?.[0];
    const aiMeta = (item as any).ai_metadata;
    return (
      <AnimatedPressable
        style={styles.userRow}
        onPress={() => handlePostPress(item.id)}
        scaleValue={0.98}
      >
        <Image
          source={{ uri: firstMedia?.media_url }}
          style={[styles.postThumbnail, { backgroundColor: themeColors.backgroundSecondary }]}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Ionicons name="sparkles" size={12} color={themeColors.accent} />
            <Text style={[styles.username, { marginLeft: 4, color: themeColors.text }]}>
              {aiMeta?.model_name || 'AI'}
            </Text>
          </View>
          <Text style={[styles.fullName, { color: themeColors.textSecondary }]} numberOfLines={2}>
            {aiMeta?.prompt || 'No prompt'}
          </Text>
        </View>
      </AnimatedPressable>
    );
  }, [handlePostPress, themeColors]);

  function getEmptyMessage() {
    switch (activeTab) {
      case 'users': return 'No users found';
      case 'tags': return 'No hashtags found';
      case 'posts': return 'No posts found';
      case 'prompts': return 'No AI prompts found';
    }
  }

  function getSearchData() {
    switch (activeTab) {
      case 'users': return { data: searchResultUsers, render: renderUserItem };
      case 'tags': return { data: searchResultHashtags, render: renderHashtagItem };
      case 'posts': return { data: searchResultPosts, render: renderSearchPostItem };
      case 'prompts': return { data: searchResultPrompts, render: renderPromptItem };
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Search Bar */}
      <Animated.View style={searchBarStyle}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.backgroundSecondary }]}>
          <Ionicons name="search" size={18} color={themeColors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search users, tags, prompts..."
            placeholderTextColor={themeColors.textSecondary}
            value={query}
            onChangeText={search}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <AnimatedPressable onPress={clearSearch} scaleValue={0.85}>
              <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
            </AnimatedPressable>
          )}
          <VisualSearchButton onPress={() => router.push('/(screens)/visual-search')} />
        </View>
      </Animated.View>

      {isSearching ? (
        <>
          <AnimatedTabBar
            tabs={SEARCH_TABS}
            activeKey={activeTab}
            onTabPress={(key) => setActiveTab(key as SearchTab)}
          />

          {searching ? (
            <SearchSkeleton />
          ) : (
            <FlashList
              data={getSearchData().data as any[]}
              keyExtractor={(item) => item.id}
              renderItem={getSearchData().render as any}
              estimatedItemSize={64}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <Ionicons name="search-outline" size={28} color={themeColors.textSecondary} />
                  </View>
                  <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{getEmptyMessage()}</Text>
                  <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>Try a different search term</Text>
                  <AnimatedPressable
                    style={[styles.emptyAction, { backgroundColor: themeColors.primary }]}
                    onPress={() => {
                      clearSearch();
                      inputRef.current?.focus();
                    }}
                    scaleValue={0.95}
                  >
                    <Text style={styles.emptyActionText}>Clear & try again</Text>
                  </AnimatedPressable>
                </View>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}
        </>
      ) : loading ? (
        <View style={styles.loaderContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View>
            <View style={styles.filterRow}>
              <AnimatedPressable
                style={[
                  styles.filterChip,
                  { backgroundColor: themeColors.background, borderColor: 'rgba(139, 92, 246, 0.3)' },
                  aiOnly && { backgroundColor: themeColors.accent, borderColor: themeColors.accent },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  toggleAiOnly();
                }}
                scaleValue={0.92}
              >
                <Ionicons
                  name="sparkles"
                  size={14}
                  color={aiOnly ? '#fff' : themeColors.accent}
                />
                <Text style={[styles.filterChipText, { color: themeColors.accent }, aiOnly && styles.filterChipTextActive]}>
                  AI Only
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.filterChip, { backgroundColor: themeColors.background, borderColor: 'rgba(139, 92, 246, 0.3)' }]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  router.push('/(screens)/trending');
                }}
                scaleValue={0.92}
              >
                <Ionicons name="trending-up" size={14} color={themeColors.primary} />
                <Text style={[styles.filterChipText, { color: themeColors.accent }]}>Trending</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.filterChip, { backgroundColor: themeColors.background, borderColor: 'rgba(139, 92, 246, 0.3)' }]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  router.push('/(screens)/communities');
                }}
                scaleValue={0.92}
              >
                <Ionicons name="people" size={14} color={themeColors.primary} />
                <Text style={[styles.filterChipText, { color: themeColors.accent }]}>Communities</Text>
              </AnimatedPressable>
            </View>
            {trendingStyles.length > 0 && (
              <TrendingStyleChips styles_data={trendingStyles} onSelect={(s: string) => search(s)} />
            )}
            {trendingPrompts.length > 0 && (
              <TrendingPromptsSection prompts={trendingPrompts.slice(0, 3)} onGenerate={(prompt: string) => router.push({ pathname: '/(camera)/generate', params: { prefillPrompt: prompt } })} />
            )}
          </View>
          {explorePosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: themeColors.backgroundSecondary }]}>
                <Ionicons name="compass-outline" size={32} color={themeColors.textSecondary} />
              </View>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No posts to explore yet</Text>
              <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>Follow creators to discover art</Text>
            </View>
          ) : (
            <MasonryGrid
              posts={explorePosts}
              onPostPress={handlePostPress}
              onEndReached={loadMore}
              loading={loadingMore}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  gridItem: {
    width: POST_GRID_SIZE,
    height: POST_GRID_SIZE,
    marginBottom: POST_GRID_GAP,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  typeIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  aiIcon: {
    left: 6,
    right: undefined,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  fullName: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    marginTop: 2,
  },
  hashtagIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashSymbol: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
  },
  postThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  aiBadgeSmall: {
    borderRadius: 4,
    padding: 2,
    marginLeft: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  emptyAction: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  emptyActionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
});
