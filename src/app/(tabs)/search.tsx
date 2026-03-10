import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
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
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { colors, spacing, fontSize, borderRadius, typography } from '@/lib/theme';
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

  function handlePostPress(postId: string) {
    router.push(`/(screens)/post/${postId}`);
  }

  function handleUserPress(userId: string) {
    router.push(`/(screens)/user/${userId}`);
  }

  function handleHashtagPress(name: string) {
    router.push(`/(screens)/hashtag/${name}`);
  }

  // Explore grid item
  function renderExploreItem({ item }: { item: PostWithUser }) {
    const firstMedia = item.media?.[0];
    const isVideo = item.post_type === 'video' || item.post_type === 'reel';
    const isCarousel = (item.media?.length || 0) > 1;
    const isAi = !!(item as any).ai_metadata;

    return (
      <TouchableOpacity
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.gridItem}>
          <Image
            source={{ uri: firstMedia?.media_url }}
            placeholder={firstMedia?.blurhash ? { blurhash: firstMedia.blurhash } : undefined}
            style={styles.gridImage}
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
      </TouchableOpacity>
    );
  }

  // Search result renderers
  function renderUserItem({ item }: { item: (typeof searchResultUsers)[0] }) {
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleUserPress(item.id)}
        activeOpacity={0.6}
      >
        <Avatar uri={item.avatar_url} size="md" />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{item.username}</Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.fullName} numberOfLines={1}>{item.full_name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function renderHashtagItem({ item }: { item: { id: string; name: string; post_count: number } }) {
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleHashtagPress(item.name)}
        activeOpacity={0.6}
      >
        <View style={styles.hashtagIcon}>
          <Text style={styles.hashSymbol}>#</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>#{item.name}</Text>
          <Text style={styles.fullName}>{formatNumber(item.post_count)} posts</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function renderSearchPostItem({ item }: { item: PostWithUser }) {
    const firstMedia = item.media?.[0];
    const isAi = !!(item as any).ai_metadata;
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.6}
      >
        <Image
          source={{ uri: firstMedia?.media_url }}
          style={styles.postThumbnail}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{item.user?.username}</Text>
            {isAi && (
              <View style={styles.aiBadgeSmall}>
                <Ionicons name="sparkles" size={8} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.fullName} numberOfLines={1}>
            {item.caption || 'No caption'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  function renderPromptItem({ item }: { item: PostWithUser }) {
    const firstMedia = item.media?.[0];
    const aiMeta = (item as any).ai_metadata;
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.6}
      >
        <Image
          source={{ uri: firstMedia?.media_url }}
          style={styles.postThumbnail}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Ionicons name="sparkles" size={12} color="#8B5CF6" />
            <Text style={[styles.username, { marginLeft: 4 }]}>
              {aiMeta?.model_name || 'AI'}
            </Text>
          </View>
          <Text style={styles.fullName} numberOfLines={2}>
            {aiMeta?.prompt || 'No prompt'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

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
    <View style={styles.container}>
      {/* Search Bar */}
      <Animated.View style={searchBarStyle}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search users, tags, prompts..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={search}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
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
            <FlatList
              data={getSearchData().data as any[]}
              keyExtractor={(item) => item.id}
              renderItem={getSearchData().render as any}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.border} />
                  <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
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
              <TouchableOpacity
                style={[styles.filterChip, aiOnly && styles.filterChipActive]}
                onPress={toggleAiOnly}
              >
                <Ionicons
                  name="sparkles"
                  size={14}
                  color={aiOnly ? '#fff' : '#8B5CF6'}
                />
                <Text style={[styles.filterChipText, aiOnly && styles.filterChipTextActive]}>
                  AI Only
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => router.push('/(screens)/trending')}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={styles.filterChipText}>Trending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => router.push('/(screens)/communities')}
              >
                <Ionicons name="people" size={14} color={colors.primary} />
                <Text style={styles.filterChipText}>Communities</Text>
              </TouchableOpacity>
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
              <Ionicons name="compass-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>No posts to explore yet</Text>
              <Text style={styles.emptySubtext}>Follow creators to discover art</Text>
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
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
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
    color: colors.text,
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
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: '#8B5CF6',
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
    backgroundColor: colors.backgroundSecondary,
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
    color: colors.text,
  },
  fullName: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hashtagIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashSymbol: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
  },
  postThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.backgroundSecondary,
  },
  aiBadgeSmall: {
    backgroundColor: '#8B5CF6',
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
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    marginTop: spacing.md,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
