import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkflowTemplates } from '@/hooks/useWorkflowTemplates';
import { WorkflowCard } from '@/components/workflows/WorkflowCard';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { WorkflowTemplateWithUser } from '@/services/workflow.service';

type Tab = 'discover' | 'mine';

export default function WorkflowsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    templates,
    myTemplates,
    savedIds,
    loading,
    hasMore,
    refresh,
    loadMore,
    search,
    searchQuery,
    toggleSave,
  } = useWorkflowTemplates(user?.id);

  const [tab, setTab] = useState<Tab>('discover');
  const data = tab === 'discover' ? templates : myTemplates;

  const renderItem = ({ item }: { item: WorkflowTemplateWithUser }) => (
    <WorkflowCard
      template={item}
      isSaved={savedIds.has(item.id)}
      onToggleSave={toggleSave}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Workflows' }} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workflows..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={search}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => search('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'discover' && styles.tabActive]}
          onPress={() => setTab('discover')}
        >
          <Text style={[styles.tabText, tab === 'discover' && styles.tabTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'mine' && styles.tabActive]}
          onPress={() => setTab('mine')}
        >
          <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>My Workflows</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && data.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={tab === 'discover' ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={refresh}
          ListHeaderComponent={
            tab === 'mine' ? (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/(screens)/workflow/create')}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Workflow</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="layers-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {tab === 'discover' ? 'No workflows found' : 'No workflows yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {tab === 'discover'
                  ? 'Try a different search term'
                  : 'Create your first workflow to chain AI steps together'}
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && data.length > 0 ? (
              <ActivityIndicator style={styles.footerLoader} color={colors.textSecondary} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  list: {
    padding: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  createButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
