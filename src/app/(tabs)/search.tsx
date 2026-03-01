import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { MasonryGrid } from '@/components/explore/MasonryGrid';
import { VisualSearchButton } from '@/components/search/VisualSearchButton';
import { TrendingPromptsSection } from '@/components/search/TrendingPromptsSection';
import { TrendingStyleChips } from '@/components/search/TrendingStyleChips';
import { useExplore } from '@/hooks/useExplore';
import { useTrending } from '@/hooks/useTrending';
import { POST_GRID_SIZE, POST_GRID_GAP } from '@/lib/constants';
import { colors, spacing, fontSize, borderRadius, typography } from '@/lib/theme';
import { formatNumber } from '@/utils/format-number';
import type { PostWithUser } from '@/types';

type SearchTab = 'users' | 'tags' | 'posts' | 'prompts';

export default function SearchRoute() {
  const router = useRouter();
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
            style={styles.gridImage}
            contentFit="cover"
          />
          {isAi && (
            <View style={[styles.typeIcon, styles.aiIcon]}>
              <Ionicons name="sparkles" size={14} color={colors.textLight} />
            </View>
          )}
          {(isCarousel || isVideo) && (
            <View style={styles.typeIcon}>
              <Ionicons
                name={isVideo ? 'play' : 'copy-outline'}
                size={16}
                color={colors.textLight}
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

  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'users', label: 'Users' },
    { key: 'tags', label: 'Tags' },
    { key: 'posts', label: 'Posts' },
    { key: 'prompts', label: 'Prompts' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={search}
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

      {isSearching ? (
        <>
          {/* Tabs */}
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {searching ? (
            <ActivityIndicator style={styles.loader} color={colors.textSecondary} />
          ) : activeTab === 'users' ? (
            <FlatList
              data={searchResultUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
            />
          ) : activeTab === 'tags' ? (
            <FlatList
              data={searchResultHashtags}
              keyExtractor={(item) => item.id}
              renderItem={renderHashtagItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hashtags found</Text>
              }
            />
          ) : activeTab === 'prompts' ? (
            <FlatList
              data={searchResultPrompts}
              keyExtractor={(item) => item.id}
              renderItem={renderPromptItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No AI prompts found</Text>
              }
            />
          ) : (
            <FlatList
              data={searchResultPosts}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchPostItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No posts found</Text>
              }
            />
          )}
        </>
      ) : loading ? (
        <ActivityIndicator style={styles.loader} color={colors.textSecondary} />
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
            <Text style={styles.emptyText}>No posts to explore yet</Text>
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    paddingVertical: 0,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  tabText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
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
  gridRow: {
    gap: POST_GRID_GAP,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
  },
  aiBadgeSmall: {
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    padding: 2,
    marginLeft: 4,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xxxl,
  },
});
