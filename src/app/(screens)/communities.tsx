import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { useCommunities } from '@/hooks/useCommunities';
import { CommunityCard } from '@/components/community/CommunityCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Community } from '@/types';

export default function CommunitiesRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    userCommunities,
    discover,
    searchResults,
    loading,
    discoverLoading,
    searchQuery,
    hasMoreDiscover,
    setSearchQuery,
    loadMoreDiscover,
  } = useCommunities(user?.id);

  const isSearching = searchQuery.trim().length > 0;
  const displayData = isSearching ? searchResults : discover;

  function renderCommunity({ item, index }: { item: Community; index: number }) {
    return (
      <Animated.View entering={FadeIn.delay(Math.min(index, 8) * 40).duration(300)}>
        <CommunityCard community={item} />
      </Animated.View>
    );
  }

  function renderHeader() {
    return (
      <View>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Your Communities */}
        {!isSearching && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Communities</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(screens)/community/create');
                }}
              >
                <Ionicons name="add" size={18} color={colors.textLight} />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.sectionLoader}>
                <Skeleton width="100%" height={64} borderRadius={borderRadius.lg} />
                <Skeleton width="100%" height={64} borderRadius={borderRadius.lg} style={{ marginTop: spacing.sm }} />
              </View>
            ) : userCommunities.length === 0 ? (
              <View style={styles.emptySectionContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="people-outline" size={24} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptySectionTitle}>No communities yet</Text>
                <Text style={styles.emptySectionText}>
                  Join or create a community to get started
                </Text>
              </View>
            ) : (
              userCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))
            )}
          </View>
        )}

        {/* Discover header */}
        {!isSearching && (
          <View style={styles.discoverHeader}>
            <Text style={styles.sectionTitle}>Discover</Text>
          </View>
        )}

        {isSearching && (
          <View style={styles.discoverHeader}>
            <Text style={styles.sectionTitle}>Search Results</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        renderItem={renderCommunity}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        onEndReached={isSearching ? undefined : loadMoreDiscover}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          discoverLoading ? (
            <View style={styles.loaderContainer}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} width="100%" height={72} borderRadius={borderRadius.lg} style={{ marginBottom: spacing.sm }} />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>
                {isSearching ? 'No communities found' : 'No communities to discover yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isSearching ? 'Try a different search term' : 'Check back later'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          !discoverLoading && hasMoreDiscover && !isSearching ? (
            <View style={styles.footer}><LoadingSpinner /></View>
          ) : null
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    padding: 0,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  createButtonText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
  sectionLoader: {
    paddingVertical: spacing.sm,
  },
  emptySectionContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptySectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySectionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  discoverHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  loaderContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
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
  footer: {
    paddingVertical: spacing.lg,
  },
});
