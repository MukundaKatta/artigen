import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useCommunities } from '@/hooks/useCommunities';
import { CommunityCard } from '@/components/community/CommunityCard';
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

  function renderCommunity({ item }: { item: Community }) {
    return <CommunityCard community={item} />;
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
                onPress={() => router.push('/(screens)/community/create')}
              >
                <Ionicons name="add" size={18} color={colors.textLight} />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={styles.sectionLoader} color={colors.primary} />
            ) : userCommunities.length === 0 ? (
              <View style={styles.emptySectionContainer}>
                <Text style={styles.emptySectionText}>
                  You haven't joined any communities yet
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
            <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>
                {isSearching ? 'No communities found' : 'No communities to discover yet'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          !discoverLoading && hasMoreDiscover && !isSearching ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
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
    paddingVertical: spacing.lg,
  },
  emptySectionContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  discoverHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loader: {
    paddingVertical: spacing.xxxl,
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
  footer: {
    paddingVertical: spacing.lg,
  },
});
