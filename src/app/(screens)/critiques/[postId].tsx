import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCritique } from '@/hooks/useCritique';
import { CritiqueCard } from '@/components/critiques/CritiqueCard';
import { CritiqueSummaryCard } from '@/components/critiques/CritiqueSummary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

// TODO: Replace with real auth hook
const MOCK_USER_ID = 'current-user-id';

export default function CritiquesScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const {
    critiques,
    summary,
    userCritique,
    helpfulVotes,
    loading,
    hasMore,
    toggleHelpful,
    loadMore,
    refresh,
  } = useCritique(postId, MOCK_USER_ID);

  const handleUserPress = useCallback(
    (userId: string) => {
      router.push(`/(screens)/user/${userId}`);
    },
    [router],
  );

  const handleWriteCritique = useCallback(() => {
    router.push(`/(screens)/critique/create/${postId}`);
  }, [router, postId]);

  const renderHeader = useCallback(() => {
    if (!summary) return null;
    return (
      <View>
        <CritiqueSummaryCard summary={summary} />

        {/* Write critique button */}
        {!userCritique && (
          <View style={styles.writeButtonContainer}>
            <Button
              title="Write a Critique"
              onPress={handleWriteCritique}
              variant="primary"
              size="lg"
              style={styles.writeButton}
            />
          </View>
        )}

        {userCritique && (
          <View style={styles.yourCritiqueHeader}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.yourCritiqueText}>You already submitted a critique</Text>
          </View>
        )}

        {critiques.length > 0 && (
          <Text style={styles.sectionTitle}>All Critiques</Text>
        )}
      </View>
    );
  }, [summary, userCritique, handleWriteCritique, critiques.length]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <FlatList
      style={styles.container}
      data={critiques}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <CritiqueCard
          critique={item}
          isHelpful={helpfulVotes.has(item.id)}
          onToggleHelpful={toggleHelpful}
          onUserPress={handleUserPress}
        />
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      onRefresh={refresh}
      refreshing={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No critiques yet</Text>
          <Text style={styles.emptySubtext}>Be the first to share your feedback on this artwork!</Text>
        </View>
      }
      ListFooterComponent={hasMore && critiques.length > 0 ? <LoadingSpinner /> : null}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  writeButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  writeButton: {
    width: '100%',
  },
  yourCritiqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(88, 195, 34, 0.08)',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 8,
  },
  yourCritiqueText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.success,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
});
